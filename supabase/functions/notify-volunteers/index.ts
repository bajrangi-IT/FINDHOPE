import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, location, latitude, longitude } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get case details
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('full_name, age, last_seen_location, contact_number')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    // Find nearby volunteers (within ~5km radius)
    const { data: volunteers, error: volError } = await supabase
      .from('volunteers')
      .select('full_name, phone, area, latitude, longitude')
      .eq('is_active', true);

    if (volError) throw volError;

    // Calculate distance and filter nearby volunteers
    const nearbyVolunteers = volunteers?.filter(vol => {
      if (!vol.latitude || !vol.longitude) return false;
      const distance = calculateDistance(
        latitude,
        longitude,
        vol.latitude,
        vol.longitude
      );
      return distance <= 5; // 5km radius
    }) || [];

    console.log(`Found ${nearbyVolunteers.length} volunteers within 5km`);

    // In a real implementation, you would send SMS/notifications here
    // For now, we'll just log the notification details
    nearbyVolunteers.forEach(volunteer => {
      console.log(`Would notify ${volunteer.full_name} (${volunteer.phone}) about ${caseData.full_name}`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        volunteersNotified: nearbyVolunteers.length,
        message: `${nearbyVolunteers.length} volunteers notified about the sighting`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error notifying volunteers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
