import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  email?: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserRole | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("role", { ascending: false });

      if (error) throw error;

      // Fetch emails for each user
      const usersWithEmails = await Promise.all(
        (data || []).map(async (userRole) => {
          const { data: authUser } = await supabase.auth.admin.getUserById(userRole.user_id);
          return {
            ...userRole,
            email: authUser?.user?.email || "Unknown"
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setAddingAdmin(true);
    try {
      // Get user by email
      const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const user = authResponse?.users?.find((u: any) => u.email === newAdminEmail);
      
      if (!user) {
        toast.error("User not found. They must sign up first.");
        return;
      }

      // Check if already has a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRole) {
        if (existingRole.role === "admin") {
          toast.info("User is already an admin");
        } else {
          // Update to admin
          const { error: updateError } = await supabase
            .from("user_roles")
            .update({ role: "admin" })
            .eq("user_id", user.id);

          if (updateError) throw updateError;
          toast.success("User promoted to admin!");
        }
      } else {
        // Insert new admin role
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "admin" });

        if (insertError) throw insertError;
        toast.success("Admin added successfully!");
      }

      setNewAdminEmail("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin: " + error.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeUserRole = async (userRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", userRole.id);

      if (error) throw error;

      toast.success("User role removed successfully!");
      fetchUsers();
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error("Failed to remove user: " + error.message);
    } finally {
      setUserToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Admin
          </CardTitle>
          <CardDescription>
            Grant admin privileges to existing users by entering their email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdmin()}
              />
            </div>
            <Button onClick={addAdmin} disabled={addingAdmin}>
              {addingAdmin ? "Adding..." : "Add Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage admin and user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((userRole) => (
              <div
                key={userRole.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {userRole.role === "admin" ? (
                    <Shield className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{userRole.email}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {userRole.user_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={userRole.role === "admin" ? "default" : "secondary"}
                  >
                    {userRole.role.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserToRemove(userRole)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the {userToRemove?.role} role from{" "}
              {userToRemove?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToRemove && removeUserRole(userToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserManagement;
