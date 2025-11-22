import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, status, priority, caseName } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    const emailPromises = [];

    // 1. Get all subscribers for this case
    const { data: subscribers, error: subError } = await supabase
      .from("case_subscribers")
      .select("email")
      .eq("case_id", caseId);

    if (!subError && subscribers && subscribers.length > 0) {
      // Send emails to all subscribers
      subscribers.forEach((sub) => {
        emailPromises.push(
          resend.emails.send({
            from: "Missing Person Alerts <onboarding@resend.dev>",
            to: [sub.email],
            subject: `Update on Missing Person Case: ${caseName}`,
            html: `
              <h1>Case Update Alert</h1>
              <p>There has been an update on the missing person case you are following:</p>
              <p><strong>Case:</strong> ${caseName}</p>
              <p><strong>New Status:</strong> ${status}</p>
              <p><strong>Priority:</strong> ${priority}</p>
              <p>Please check the platform for more details.</p>
              <br/>
              <p>If you wish to unsubscribe from these alerts, please contact us.</p>
            `,
          })
        );
      });
    }

    // 2. Get all admin users
    const { data: admins, error: adminError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminError && admins && admins.length > 0) {
      // Get admin emails from auth
      for (const admin of admins) {
        const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
        if (userData?.user?.email) {
          emailPromises.push(
            resend.emails.send({
              from: "Missing Person Alerts <onboarding@resend.dev>",
              to: [userData.user.email],
              subject: `[ADMIN] Case Update: ${caseName}`,
              html: `
                <h1>Admin Alert: Case Update</h1>
                <p>A case has been updated in the system:</p>
                <p><strong>Case ID:</strong> ${caseId}</p>
                <p><strong>Case:</strong> ${caseName}</p>
                <p><strong>New Status:</strong> ${status}</p>
                <p><strong>Priority:</strong> ${priority}</p>
                <p>Please review this case in the admin dashboard.</p>
              `,
            })
          );
        }
      }
    }

    // 3. Get nearby volunteers (if location data is available)
    const { data: caseData } = await supabase
      .from("cases")
      .select("last_seen_location")
      .eq("id", caseId)
      .single();

    const { data: volunteers } = await supabase
      .from("volunteers")
      .select("user_id, area, full_name")
      .eq("is_active", true);

    if (volunteers && volunteers.length > 0) {
      for (const volunteer of volunteers) {
        const { data: volUser } = await supabase.auth.admin.getUserById(volunteer.user_id);
        if (volUser?.user?.email) {
          emailPromises.push(
            resend.emails.send({
              from: "Missing Person Alerts <onboarding@resend.dev>",
              to: [volUser.user.email],
              subject: `[VOLUNTEER] New Case Update in Your Area`,
              html: `
                <h1>Volunteer Alert: Case Update</h1>
                <p>A missing person case has been updated in your area:</p>
                <p><strong>Case:</strong> ${caseName}</p>
                <p><strong>Location:</strong> ${caseData?.last_seen_location || "Unknown"}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Priority:</strong> ${priority}</p>
                <p>Thank you for your service as a volunteer.</p>
              `,
            })
          );
        }
      }
    }

    if (emailPromises.length === 0) {
      return new Response(JSON.stringify({ message: "No recipients found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        message: "Notifications sent successfully",
        recipientsNotified: emailPromises.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in notify-case-update:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});