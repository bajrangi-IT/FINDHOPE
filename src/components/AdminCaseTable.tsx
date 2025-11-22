import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import AdminCaseEditModal from "./AdminCaseEditModal";
import AdminCloseCaseModal from "./AdminCloseCaseModal";

interface Case {
  id: string;
  case_type: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  status: string | null;
  priority: string | null;
  hospital_name: string | null;
  hospital_location: string | null;
  last_seen_location: string | null;
  created_at: string;
  [key: string]: any;
}

const AdminCaseTable = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [closingCase, setClosingCase] = useState<Case | null>(null);

  useEffect(() => {
    fetchCases();

    // Subscribe to realtime changes on cases table
    const channel = supabase
      .channel('cases-table-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases'
        },
        () => {
          // Refetch cases when any change occurs
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
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      toast.error("Failed to load cases");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, caseName: string) => {
    if (!confirm(`Are you sure you want to delete the case for ${caseName}? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Case deleted successfully");
      fetchCases();
    } catch (error: any) {
      toast.error("Failed to delete case: " + error.message);
      console.error(error);
    }
  };

  const handleMarkAsFound = async (caseItem: Case) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({
          status: "found",
          updated_at: new Date().toISOString()
        })
        .eq("id", caseItem.id);

      if (error) throw error;

      // Notify subscribers
      await supabase.functions.invoke("notify-case-update", {
        body: {
          caseId: caseItem.id,
          status: "found",
          priority: caseItem.priority || "medium",
          caseName: caseItem.full_name || "Unknown"
        }
      });

      toast.success("Case marked as found!");
      fetchCases();
    } catch (error: any) {
      toast.error("Failed to update case: " + error.message);
      console.error(error);
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "default";
      case "found": return "secondary";
      case "cold": return "outline";
      default: return "outline";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading cases...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Cases ({cases.length})</h2>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell>
                  <Badge variant={caseItem.case_type === "missing" ? "default" : "destructive"}>
                    {caseItem.case_type === "missing" ? "Missing" : "Accident"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{caseItem.full_name || "Unknown"}</TableCell>
                <TableCell>{caseItem.age || "N/A"}</TableCell>
                <TableCell>{caseItem.gender || "N/A"}</TableCell>
                <TableCell>
                  {caseItem.case_type === "unknown_accident" 
                    ? caseItem.hospital_location 
                    : caseItem.last_seen_location}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(caseItem.status)}>
                    {caseItem.status || "active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(caseItem.priority)}>
                    {caseItem.priority || "medium"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(caseItem.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {caseItem.status !== "found" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsFound(caseItem)}
                          title="Quick mark as found"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setClosingCase(caseItem)}
                          title="Close case with statement"
                        >
                          <XCircle className="w-4 h-4 text-orange-600" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCase(caseItem)}
                      title="Edit case"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(caseItem.id, caseItem.full_name || "Unknown")}
                      title="Delete case"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingCase && (
        <AdminCaseEditModal
          caseData={editingCase}
          onClose={() => setEditingCase(null)}
          onSave={() => {
            setEditingCase(null);
            fetchCases();
          }}
        />
      )}

      {closingCase && (
        <AdminCloseCaseModal
          caseId={closingCase.id}
          caseName={closingCase.full_name || "Unknown"}
          onClose={() => setClosingCase(null)}
          onSave={() => {
            setClosingCase(null);
            fetchCases();
          }}
        />
      )}
    </div>
  );
};

export default AdminCaseTable;