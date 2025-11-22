import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { ReportForm } from "@/components/ReportForm";
import { SearchSection } from "@/components/SearchSection";
import { HeatmapSection } from "@/components/HeatmapSection";
import { CommunitySection } from "@/components/CommunitySection";
import { HowItWorks } from "@/components/HowItWorks";
import { AboutSection } from "@/components/AboutSection";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AccidentReportForm from "@/components/AccidentReportForm";
import { MissingCase } from "@/types/case";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [loading, setLoading] = useState(true);

  // Fetch cases from database
  useEffect(() => {
    fetchCases();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('cases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases'
        },
        () => {
          fetchCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('case_type', 'missing')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database cases to MissingCase format
      const transformedCases: MissingCase[] = (data || []).map((c: any) => ({
        id: c.id,
        fullName: c.full_name || '',
        age: c.age || 0,
        gender: c.gender || 'Other',
        relation: c.relation || '',
        lastSeenLocation: c.last_seen_location || '',
        lastSeenDate: c.last_seen_date || '',
        lastSeenTime: c.last_seen_time || '',
        clothesDescription: c.clothes_description || '',
        physicalMarks: c.physical_marks || '',
        contactNumber: c.contact_number || '',
        email: c.email || '',
        photoUrl: c.photo_url,
        reportedDate: c.created_at,
        status: c.status || 'active',
        priority: c.priority || 'medium',
        updates: [],
        rewardAmount: c.reward_amount,
        socialMediaLinks: c.social_media_links,
        healthNotes: c.health_notes,
        lastOnlineActivity: c.last_online_activity,
        recoveredBelongings: c.recovered_belongings,
        knownRoutes: c.known_routes,
        communityContacts: c.community_contacts,
        cctvFootageInfo: c.cctv_footage_info,
        qrCodeLink: c.qr_code_link,
      }));

      setCases(transformedCases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main>
        <section id="home">
          <HeroSection setActiveSection={setActiveSection} />
        </section>
        
        <StatsSection cases={cases} />
        
        <section id="report" className="py-20 px-4">
          <ReportForm />
        </section>
        
        <section id="search" className="py-20 px-4 bg-muted/30">
          <SearchSection cases={cases} />
        </section>
        
        <HeatmapSection cases={cases} />
        
        <section id="community" className="py-20 px-4">
          <CommunitySection />
        </section>
        
        <HowItWorks />
        
        <AccidentReportForm />
        
        <section id="about" className="py-20 px-4 bg-muted/30">
          <AboutSection />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
