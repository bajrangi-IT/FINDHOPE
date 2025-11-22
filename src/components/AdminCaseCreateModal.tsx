import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminCaseCreateModalProps {
  onClose: () => void;
  onSave: () => void;
}

const AdminCaseCreateModal = ({ onClose, onSave }: AdminCaseCreateModalProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    case_type: "missing" as "missing" | "unknown_accident",
    full_name: "",
    age: "",
    gender: "Male",
    relation: "",
    last_seen_location: "",
    last_seen_date: "",
    last_seen_time: "",
    clothes_description: "",
    physical_marks: "",
    contact_number: "",
    email: "",
    photo_url: "",
    status: "active",
    priority: "medium",
    health_notes: "",
    social_media_links: "",
    known_routes: "",
    community_contacts: "",
    cctv_footage_info: "",
    // Accident specific fields
    accident_type: "",
    hospital_name: "",
    hospital_location: "",
    police_station: "",
    injury_description: "",
    reporter_name: "",
    reporter_contact: ""
  });

  const handleSave = async () => {
    if (!formData.full_name || !formData.contact_number) {
      toast.error("Please fill in required fields (Name and Contact)");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("cases").insert({
        case_type: formData.case_type,
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        relation: formData.relation || null,
        last_seen_location: formData.last_seen_location || null,
        last_seen_date: formData.last_seen_date || null,
        last_seen_time: formData.last_seen_time || null,
        clothes_description: formData.clothes_description || null,
        physical_marks: formData.physical_marks || null,
        contact_number: formData.contact_number,
        email: formData.email || null,
        photo_url: formData.photo_url || null,
        status: formData.status,
        priority: formData.priority,
        health_notes: formData.health_notes || null,
        social_media_links: formData.social_media_links || null,
        known_routes: formData.known_routes || null,
        community_contacts: formData.community_contacts || null,
        cctv_footage_info: formData.cctv_footage_info || null,
        accident_type: formData.accident_type || null,
        hospital_name: formData.hospital_name || null,
        hospital_location: formData.hospital_location || null,
        police_station: formData.police_station || null,
        injury_description: formData.injury_description || null,
        reporter_name: formData.reporter_name || null,
        reporter_contact: formData.reporter_contact || null,
      });

      if (error) throw error;

      toast.success("Case created successfully!");
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="case_type">Case Type *</Label>
            <Select
              value={formData.case_type}
              onValueChange={(value: "missing" | "unknown_accident") =>
                setFormData({ ...formData, case_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missing">Missing Person</SelectItem>
                <SelectItem value="unknown_accident">Unknown Accident Victim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
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

            <div className="grid gap-2">
              <Label htmlFor="relation">Relation</Label>
              <Input
                id="relation"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              />
            </div>
          </div>

          {formData.case_type === "missing" && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="last_seen_location">Last Seen Location</Label>
                  <Input
                    id="last_seen_location"
                    value={formData.last_seen_location}
                    onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="last_seen_date">Last Seen Date</Label>
                  <Input
                    id="last_seen_date"
                    type="date"
                    value={formData.last_seen_date}
                    onChange={(e) => setFormData({ ...formData, last_seen_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="last_seen_time">Last Seen Time</Label>
                  <Input
                    id="last_seen_time"
                    type="time"
                    value={formData.last_seen_time}
                    onChange={(e) => setFormData({ ...formData, last_seen_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="clothes_description">Clothing Description</Label>
                <Textarea
                  id="clothes_description"
                  value={formData.clothes_description}
                  onChange={(e) => setFormData({ ...formData, clothes_description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="physical_marks">Physical Marks</Label>
                <Textarea
                  id="physical_marks"
                  value={formData.physical_marks}
                  onChange={(e) => setFormData({ ...formData, physical_marks: e.target.value })}
                />
              </div>
            </>
          )}

          {formData.case_type === "unknown_accident" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="accident_type">Accident Type</Label>
                <Input
                  id="accident_type"
                  value={formData.accident_type}
                  onChange={(e) => setFormData({ ...formData, accident_type: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hospital_name">Hospital Name</Label>
                  <Input
                    id="hospital_name"
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hospital_location">Hospital Location</Label>
                  <Input
                    id="hospital_location"
                    value={formData.hospital_location}
                    onChange={(e) => setFormData({ ...formData, hospital_location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="police_station">Police Station</Label>
                <Input
                  id="police_station"
                  value={formData.police_station}
                  onChange={(e) => setFormData({ ...formData, police_station: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="injury_description">Injury Description</Label>
                <Textarea
                  id="injury_description"
                  value={formData.injury_description}
                  onChange={(e) => setFormData({ ...formData, injury_description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reporter_name">Reporter Name</Label>
                  <Input
                    id="reporter_name"
                    value={formData.reporter_name}
                    onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reporter_contact">Reporter Contact</Label>
                  <Input
                    id="reporter_contact"
                    value={formData.reporter_contact}
                    onChange={(e) => setFormData({ ...formData, reporter_contact: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input
              id="photo_url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Creating..." : "Create Case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCaseCreateModal;
