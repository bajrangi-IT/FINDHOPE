import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaseData {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  clothes_description: string;
  physical_marks: string;
  case_type: 'missing' | 'unknown_accident';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, caseType } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current case
    const { data: currentCase, error: currentError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (currentError) throw currentError;

    // Look for potential matches in the opposite case type
    const oppositeType = caseType === 'missing' ? 'unknown_accident' : 'missing';
    
    const { data: potentialMatches, error: matchError } = await supabase
      .from('cases')
      .select('*')
      .eq('case_type', oppositeType)
      .eq('status', 'active');

    if (matchError) throw matchError;

    // Simple matching algorithm based on:
    // - Similar age (within 5 years)
    // - Same gender
    // - Similar location or date
    const matches = potentialMatches?.filter((match: CaseData) => {
      const ageDiff = Math.abs((match.age || 0) - (currentCase.age || 0));
      const sameGender = match.gender === currentCase.gender;
      const similarLocation = 
        match.last_seen_location?.toLowerCase().includes(currentCase.last_seen_location?.toLowerCase() || '') ||
        currentCase.last_seen_location?.toLowerCase().includes(match.last_seen_location?.toLowerCase() || '');
      
      // Check if dates are within 7 days of each other
      const dateDiff = match.last_seen_date && currentCase.last_seen_date
        ? Math.abs(new Date(match.last_seen_date).getTime() - new Date(currentCase.last_seen_date).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      return ageDiff <= 5 && sameGender && (similarLocation || dateDiff <= 7);
    }) || [];

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches,
        matchCount: matches.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error checking matches:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
