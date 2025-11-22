import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapView } from "@/components/MapView";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, MapPin, Phone, Bell } from "lucide-react";

const VolunteerDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [nearbyCases, setNearbyCases] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [caseUpdates, setCaseUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchVolunteerData(session.user.id);
  };

  const fetchVolunteerData = async (userId: string) => {
    setLoading(true);
    
    // Get volunteer profile
    const { data: volData, error: volError } = await supabase
      .from("volunteers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (volError || !volData) {
      toast.error("You need to register as a volunteer first");
      navigate("/volunteer");
      return;
    }

    setVolunteer(volData);
    
    // Get nearby missing cases
    const { data: casesData, error: casesError } = await supabase
      .from("cases")
      .select("*")
      .eq("status", "active")
      .eq("case_type", "missing")
      .order("created_at", { ascending: false });

    if (casesError) {
      toast.error("Failed to load nearby cases");
    } else {
      // Filter cases within 10km radius (if volunteer has location)
      if (volData.latitude && volData.longitude) {
        const nearby = casesData?.filter((case_) => {
          // For now, show all active cases
          // In production, you'd calculate distance based on last_seen_location coordinates
          return true;
        }) || [];
        setNearbyCases(nearby);
      } else {
        setNearbyCases(casesData || []);
      }
    }

    // Get camera sightings (notifications)
    const { data: sightings, error: sightingsError } = await supabase
      .from("camera_sightings")
      .select("*, cases(full_name, last_seen_location)")
      .order("detected_at", { ascending: false })
      .limit(10);

    if (!sightingsError) {
      setNotifications(sightings || []);
    }

    setLoading(false);

    // Subscribe to real-time updates for camera sightings
    const sightingsChannel = supabase
      .channel('volunteer-sightings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'camera_sightings'
        },
        (payload) => {
          toast.success("New sighting detected nearby!");
          fetchVolunteerData(userId);
        }
      )
      .subscribe();

    // Subscribe to real-time case updates (status/priority changes)
    const casesChannel = supabase
      .channel('volunteer-case-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases'
        },
        (payload) => {
          const newCase = payload.new as any;
          toast.info(`Case Update: ${newCase.full_name} - Status: ${newCase.status}`);
          
          // Add to case updates list
          setCaseUpdates(prev => [{
            id: newCase.id,
            case_name: newCase.full_name,
            status: newCase.status,
            priority: newCase.priority,
            updated_at: new Date().toISOString(),
            type: 'status_change'
          }, ...prev.slice(0, 9)]);
          
          fetchVolunteerData(userId);
        }
      )
      .subscribe();

    // Subscribe to new cases being created
    const newCasesChannel = supabase
      .channel('volunteer-new-cases')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cases'
        },
        (payload) => {
          const newCase = payload.new as any;
          if (newCase.case_type === 'missing' && newCase.status === 'active') {
            toast.info(`New Missing Person Case: ${newCase.full_name}`);
            fetchVolunteerData(userId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sightingsChannel);
      supabase.removeChannel(casesChannel);
      supabase.removeChannel(newCasesChannel);
    };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Volunteer Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome {volunteer?.full_name} • {volunteer?.area}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Real-Time Notifications */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Sightings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground">No recent sightings</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-semibold">{notification.cases?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="inline h-3 w-3 mr-1" />
                            {notification.camera_location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {(notification.confidence_score * 100).toFixed(0)}% Match
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.detected_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Case Updates Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseUpdates.length === 0 ? (
                  <p className="text-muted-foreground">No recent case updates</p>
                ) : (
                  <div className="space-y-3">
                    {caseUpdates.slice(0, 5).map((update, index) => (
                      <div key={`${update.id}-${index}`} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{update.case_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(update.priority)} variant="outline">
                              {update.status}
                            </Badge>
                            <Badge variant="secondary">{update.priority}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map View */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Geographical Overview</h2>
            <MapView cases={nearbyCases} sightings={notifications} />
          </div>

          {/* Nearby Missing Cases */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Active Cases Nearby</h2>
            <p className="text-muted-foreground">Help reunite missing persons with their families</p>
          </div>

          <div className="grid gap-6">
            {nearbyCases.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No active cases in your area at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              nearbyCases.map((case_) => (
                <Card key={case_.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        {case_.photo_url && (
                          <img 
                            src={case_.photo_url} 
                            alt={case_.full_name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {case_.full_name}
                          </CardTitle>
                          <p className="text-muted-foreground">
                            {case_.age} years old • {case_.gender}
                          </p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(case_.priority)}>
                        {case_.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Last Seen Location:
                        </p>
                        <p className="text-sm text-muted-foreground">{case_.last_seen_location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Last Seen:</p>
                        <p className="text-sm text-muted-foreground">
                          {case_.last_seen_date} at {case_.last_seen_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Physical Description:</p>
                        <p className="text-sm text-muted-foreground">{case_.clothes_description}</p>
                      </div>
                      {case_.physical_marks && (
                        <div>
                          <p className="text-sm font-semibold mb-1">Identifying Marks:</p>
                          <p className="text-sm text-muted-foreground">{case_.physical_marks}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Emergency Contact:
                        </p>
                        <p className="text-sm text-muted-foreground">{case_.contact_number}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => navigate(`/case/${case_.id}`)}
                        >
                          View Full Details
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            window.location.href = `tel:${case_.contact_number}`;
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VolunteerDashboard;
