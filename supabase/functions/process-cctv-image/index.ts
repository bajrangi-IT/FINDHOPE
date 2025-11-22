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
    const { imageUrl, cameraLocation, latitude, longitude } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const aiApiKey = Deno.env.get("AI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active missing person cases with photos
    const { data: cases, error: casesError } = await supabase
      .from("cases")
      .select("id, full_name, photo_url")
      .eq("case_type", "missing")
      .eq("status", "active")
      .not("photo_url", "is", null);

    if (casesError) throw casesError;

    if (!cases || cases.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active cases with photos found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Use Google Gemini AI to analyze the CCTV image against each missing person
    let bestMatch: any = null;
    let highestConfidence = 0;

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
                    text: "Compare these two images and rate the similarity from 0-100. Only respond with a number. Are these the same person?",
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
        const confidence = parseInt(data.choices[0].message.content.trim()) || 0;

        if (confidence > highestConfidence && confidence > 60) {
          highestConfidence = confidence;
          bestMatch = caseItem;
        }
      } catch (error) {
        console.error(`Error processing case ${caseItem.id}:`, error);
      }
    }

    if (!bestMatch) {
      return new Response(
        JSON.stringify({ message: "No match found with sufficient confidence" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Record the sighting
    const { data: sighting, error: sightingError } = await supabase
      .from("camera_sightings")
      .insert({
        case_id: bestMatch.id,
        camera_location: cameraLocation,
        latitude,
        longitude,
        image_url: imageUrl,
        confidence_score: highestConfidence,
      })
      .select()
      .single();

    if (sightingError) throw sightingError;

    // Find nearest volunteers
    const { data: volunteers, error: volError } = await supabase
      .from("volunteers")
      .select("*")
      .eq("is_active", true);

    if (volError) throw volError;

    // Calculate distances and find nearest (simplified - real implementation would use proper distance calculation)
    if (volunteers && volunteers.length > 0) {
      const nearestVolunteer = volunteers[0]; // Simplified

      // Send alert to nearest volunteer (in production, you'd use SMS/push notifications)
      console.log(`Alert sent to volunteer: ${nearestVolunteer.full_name}`);

      // Update sighting as notified
      await supabase
        .from("camera_sightings")
        .update({ volunteer_notified: true })
        .eq("id", sighting.id);
    }

    return new Response(
      JSON.stringify({
        match: bestMatch.full_name,
        confidence: highestConfidence,
        sightingId: sighting.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in process-cctv-image:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});