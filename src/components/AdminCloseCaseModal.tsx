import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminCloseCaseModalProps {
  caseId: string;
  caseName: string;
  onClose: () => void;
  onSave: () => void;
}

const AdminCloseCaseModal = ({ caseId, caseName, onClose, onSave }: AdminCloseCaseModalProps) => {
  const [saving, setSaving] = useState(false);
  const [closingStatement, setClosingStatement] = useState("");

  const handleClose = async () => {
    if (!closingStatement.trim()) {
      toast.error("Please enter a closing statement");
      return;
    }

    setSaving(true);
    try {
      // Update case status to found with closing statement
      const { error } = await supabase
        .from("cases")
        .update({
          status: "found",
          recovered_belongings: closingStatement, // Store closing statement in recovered_belongings field
          updated_at: new Date().toISOString()
        })
        .eq("id", caseId);

      if (error) throw error;

      // Notify subscribers
      await supabase.functions.invoke("notify-case-update", {
        body: {
          caseId,
          status: "found",
          priority: "resolved",
          caseName
        }
      });

      toast.success("Case closed successfully!");
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error closing case:", error);
      toast.error("Failed to close case: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Close Case: {caseName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="closing-statement">Closing Statement *</Label>
            <Textarea
              id="closing-statement"
              placeholder="Enter details about how the case was resolved, where the person was found, their current condition, and any other relevant information..."
              value={closingStatement}
              onChange={(e) => setClosingStatement(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              This statement will be visible to all subscribers and will be included in the final case record.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={saving}>
            {saving ? "Closing Case..." : "Close Case as Found"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCloseCaseModal;
