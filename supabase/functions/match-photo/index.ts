import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const aiApiKey = Deno.env.get("AI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active missing person cases with photos
    const { data: cases, error: casesError } = await supabase
      .from("cases")
      .select("id, full_name, photo_url, age, gender, last_seen_location, last_seen_date, clothes_description, physical_marks, reward_amount")
      .eq("case_type", "missing")
      .eq("status", "active")
      .not("photo_url", "is", null);

    if (casesError) throw casesError;

    if (!cases || cases.length === 0) {
      console.log("No active missing person cases with photos found in database");
      return new Response(
        JSON.stringify({ matches: [], message: "No active cases with photos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${cases.length} active missing person cases to compare against`);

    // Use Google Gemini AI to compare the uploaded photo with each missing person
    const matches: any[] = [];

    for (const caseItem of cases) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${aiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Compare these two images and determine if they show the same person. Consider facial features, age, and any distinguishing characteristics. Return a confidence score from 0 to 100. Only return the number.",
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageUrl },
                  },
                  {
                    type: "image_url",
                    image_url: { url: caseItem.photo_url },
                  },
                ],
              },
            ],
          }),
        });

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        const confidence = parseInt(content) || 0;

        console.log(`Case ${caseItem.full_name}: confidence score ${confidence}`);

        if (confidence >= 40) { // Lowered threshold from 50 to 40
          matches.push({
            ...caseItem,
            confidence_score: confidence,
          });
        }
      } catch (error) {
        console.error(`Error processing case ${caseItem.id}:`, error);
      }
    }

    // Sort matches by confidence score
    matches.sort((a, b) => b.confidence_score - a.confidence_score);

    return new Response(
      JSON.stringify({ matches }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in match-photo function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
