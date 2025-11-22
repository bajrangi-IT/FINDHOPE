import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AdminCaseEditModalProps {
  caseData: any;
  onClose: () => void;
  onSave: () => void;
}

const AdminCaseEditModal = ({ caseData, onClose, onSave }: AdminCaseEditModalProps) => {
  const [formData, setFormData] = useState(caseData);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const oldStatus = caseData.status;
      const oldPriority = caseData.priority;

      const { error } = await supabase
        .from("cases")
        .update({
          full_name: formData.full_name,
          age: formData.age,
          gender: formData.gender,
          status: formData.status,
          priority: formData.priority,
          last_seen_location: formData.last_seen_location,
          hospital_name: formData.hospital_name,
          hospital_location: formData.hospital_location,
          clothes_description: formData.clothes_description,
          physical_marks: formData.physical_marks,
          contact_number: formData.contact_number,
          email: formData.email,
          reward_amount: formData.reward_amount,
        })
        .eq("id", caseData.id);

      if (error) throw error;

      // Send notifications if status or priority changed
      if (oldStatus !== formData.status || oldPriority !== formData.priority) {
        await supabase.functions.invoke("notify-case-update", {
          body: {
            caseId: caseData.id,
            status: formData.status,
            priority: formData.priority,
            caseName: formData.full_name,
          },
        });
      }

      toast.success("Case updated successfully");
      onSave();
    } catch (error: any) {
      toast.error("Failed to update case");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name || ""}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender || ""} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || "active"} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="cold">Cold Case</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority || "medium"} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward_amount">Reward Amount ($)</Label>
              <Input
                id="reward_amount"
                type="number"
                value={formData.reward_amount || 0}
                onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                value={formData.contact_number || ""}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {formData.case_type === "missing" && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="last_seen_location">Last Seen Location</Label>
                <Input
                  id="last_seen_location"
                  value={formData.last_seen_location || ""}
                  onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
                />
              </div>
            )}

            {formData.case_type === "unknown_accident" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hospital_name">Hospital Name</Label>
                  <Input
                    id="hospital_name"
                    value={formData.hospital_name || ""}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital_location">Hospital Location</Label>
                  <Input
                    id="hospital_location"
                    value={formData.hospital_location || ""}
                    onChange={(e) => setFormData({ ...formData, hospital_location: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="clothes_description">Clothes Description</Label>
              <Textarea
                id="clothes_description"
                value={formData.clothes_description || ""}
                onChange={(e) => setFormData({ ...formData, clothes_description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="physical_marks">Physical Marks</Label>
              <Textarea
                id="physical_marks"
                value={formData.physical_marks || ""}
                onChange={(e) => setFormData({ ...formData, physical_marks: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCaseEditModal;