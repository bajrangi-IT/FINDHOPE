import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Plus } from "lucide-react";

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
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
    fetchUserCases(session.user.id);
  };

  const fetchUserCases = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load your cases");
    } else {
      setCases(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-yellow-500";
      case "found": return "bg-green-500";
      case "cold": return "bg-gray-500";
      default: return "bg-gray-500";
    }
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
              <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your reported cases
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/")}>
                <Plus className="mr-2 h-4 w-4" />
                Report New Case
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {cases.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't reported any cases yet.
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Report a Missing Person
                  </Button>
                </CardContent>
              </Card>
            ) : (
              cases.map((case_) => (
                <Card key={case_.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {case_.full_name}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {case_.age} years old • {case_.gender}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(case_.status)}>
                          {case_.status}
                        </Badge>
                        <Badge className={getPriorityColor(case_.priority)}>
                          {case_.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Last Seen Location:</p>
                        <p className="text-sm text-muted-foreground">{case_.last_seen_location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Last Seen Date & Time:</p>
                        <p className="text-sm text-muted-foreground">
                          {case_.last_seen_date} at {case_.last_seen_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Contact:</p>
                        <p className="text-sm text-muted-foreground">{case_.contact_number}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/case/${case_.id}`)}
                        >
                          View Details
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

export default UserDashboard;
