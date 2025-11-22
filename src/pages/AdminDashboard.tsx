import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, LogOut } from "lucide-react";
import AdminCaseTable from "@/components/AdminCaseTable";
import CameraSightings from "@/components/CameraSightings";
import AdminCaseCreateModal from "@/components/AdminCaseCreateModal";
import AdminStatisticsCards from "@/components/AdminStatisticsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        toast.error("Failed to verify admin access");
        navigate("/");
        return;
      }

      if (!roles) {
        toast.error("You do not have admin access");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Admin ID: {user?.id?.slice(0, 8)}...</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <AdminStatisticsCards />
        
        <Tabs defaultValue="cases" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-xl">
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="sightings">CCTV Sightings</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Case
            </Button>
          </div>
          
          <TabsContent value="cases">
            <AdminCaseTable key={refreshKey} />
          </TabsContent>
          <TabsContent value="sightings">
            <CameraSightings />
          </TabsContent>
        </Tabs>

        {showCreateModal && (
          <AdminCaseCreateModal
            onClose={() => setShowCreateModal(false)}
            onSave={() => {
              setRefreshKey(prev => prev + 1);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;