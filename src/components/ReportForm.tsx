import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReportFormProps {
  onSubmit?: () => void;
}

export const ReportForm = ({ onSubmit }: ReportFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    relation: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    lastSeenTime: "",
    clothesDescription: "",
    physicalMarks: "",
    contactNumber: "",
    email: "",
    rewardAmount: "",
    socialMediaLinks: "",
    healthNotes: "",
    lastOnlineActivity: "",
    recoveredBelongings: "",
    knownRoutes: "",
    communityContacts: "",
    cctvFootageInfo: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter the person's full name");
      return false;
    }
    if (!formData.age || parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
      toast.error("Please enter a valid age");
      return false;
    }
    if (!formData.contactNumber.match(/^[+]?[\d\s-()]+$/)) {
      toast.error("Please enter a valid contact number");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const age = parseInt(formData.age);
    const priority: "high" | "medium" | "low" = 
      age < 18 || age > 60 ? "high" : "medium";

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to report a missing person");
        return;
      }

      // Insert case into database
      const { data: caseData, error } = await supabase
        .from("cases")
        .insert({
          case_type: "missing",
          full_name: formData.fullName,
          age,
          gender: formData.gender,
          relation: formData.relation,
          last_seen_location: formData.lastSeenLocation,
          last_seen_date: formData.lastSeenDate,
          last_seen_time: formData.lastSeenTime,
          clothes_description: formData.clothesDescription,
          physical_marks: formData.physicalMarks,
          contact_number: formData.contactNumber,
          email: formData.email,
          photo_url: photoPreview,
          status: "active",
          priority,
          user_id: user.id,
          reward_amount: formData.rewardAmount ? parseFloat(formData.rewardAmount) : 0,
          social_media_links: formData.socialMediaLinks,
          health_notes: formData.healthNotes,
          last_online_activity: formData.lastOnlineActivity,
          recovered_belongings: formData.recoveredBelongings,
          known_routes: formData.knownRoutes,
          community_contacts: formData.communityContacts,
          cctv_footage_info: formData.cctvFootageInfo,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate QR code link
      const qrCodeLink = `${window.location.origin}/case/${caseData.id}`;
      
      // Update case with QR code link
      await supabase
        .from("cases")
        .update({ qr_code_link: qrCodeLink })
        .eq("id", caseData.id);

      // Check for potential matches with accident reports
      try {
        const { data: matchData } = await supabase.functions.invoke('check-case-matches', {
          body: { caseId: caseData.id, caseType: "missing" }
        });

        if (matchData?.matchCount > 0) {
          toast.success(
            `Case reported successfully! ⚠️ We found ${matchData.matchCount} potential accident report match(es) that might be related. Please check the case details.`,
            { duration: 8000 }
          );
        } else {
          toast.success(`Case reported successfully!`, {
            description: "Community has been alerted. We'll help find them.",
            icon: <CheckCircle className="text-success" />
          });
        }
      } catch (matchError) {
        console.error("Error checking matches:", matchError);
        toast.success(`Case reported successfully!`, {
          description: "Community has been alerted. We'll help find them.",
          icon: <CheckCircle className="text-success" />
        });
      }

      // Reset form
      setFormData({
        fullName: "",
        age: "",
        gender: "",
        relation: "",
        lastSeenLocation: "",
        lastSeenDate: "",
        lastSeenTime: "",
        clothesDescription: "",
        physicalMarks: "",
        contactNumber: "",
        email: "",
        rewardAmount: "",
        socialMediaLinks: "",
        healthNotes: "",
        lastOnlineActivity: "",
        recoveredBelongings: "",
        knownRoutes: "",
        communityContacts: "",
        cctvFootageInfo: "",
      });
      setPhotoPreview("");

      if (onSubmit) onSubmit();
    } catch (error: any) {
      console.error("Error submitting case:", error);
      toast.error("Failed to submit case. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Report a Missing Person</h2>
        <p className="text-lg text-muted-foreground">
          Every detail helps. Fill out this form to alert the community and authorities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-elevated p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              placeholder="Enter age"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relation">Your Relation *</Label>
            <Input
              id="relation"
              value={formData.relation}
              onChange={(e) => handleInputChange("relation", e.target.value)}
              placeholder="e.g., Parent, Friend, Guardian"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastSeenDate">Last Seen Date *</Label>
            <Input
              id="lastSeenDate"
              type="date"
              value={formData.lastSeenDate}
              onChange={(e) => handleInputChange("lastSeenDate", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastSeenTime">Last Seen Time *</Label>
            <Input
              id="lastSeenTime"
              type="time"
              value={formData.lastSeenTime}
              onChange={(e) => handleInputChange("lastSeenTime", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastSeenLocation">Last Seen Location *</Label>
          <Input
            id="lastSeenLocation"
            value={formData.lastSeenLocation}
            onChange={(e) => handleInputChange("lastSeenLocation", e.target.value)}
            placeholder="e.g., Central Park, New York"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clothesDescription">Clothes Description *</Label>
          <Textarea
            id="clothesDescription"
            value={formData.clothesDescription}
            onChange={(e) => handleInputChange("clothesDescription", e.target.value)}
            placeholder="Describe what they were wearing"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="physicalMarks">Physical Marks / Distinguishing Features</Label>
          <Textarea
            id="physicalMarks"
            value={formData.physicalMarks}
            onChange={(e) => handleInputChange("physicalMarks", e.target.value)}
            placeholder="Scars, tattoos, birthmarks, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              placeholder="+1-555-0123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Upload Photo (Optional)</Label>
          <div className="flex items-center gap-4">
            <label htmlFor="photo" className="cursor-pointer">
              <div className="glass-card p-4 rounded-xl hover:glass-elevated transition-all flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Choose Photo</span>
              </div>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
            )}
          </div>
        </div>

        {/* Optional Details Section */}
        <div className="border-t pt-6 space-y-6">
          <h3 className="text-xl font-semibold">Optional Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="rewardAmount">Reward Amount (₹)</Label>
            <Input
              id="rewardAmount"
              type="number"
              value={formData.rewardAmount}
              onChange={(e) => handleInputChange("rewardAmount", e.target.value)}
              placeholder="Enter reward amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialMediaLinks">Social Media Links</Label>
            <Input
              id="socialMediaLinks"
              value={formData.socialMediaLinks}
              onChange={(e) => handleInputChange("socialMediaLinks", e.target.value)}
              placeholder="Facebook, Instagram, Twitter links"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthNotes">Health Notes</Label>
            <Textarea
              id="healthNotes"
              value={formData.healthNotes}
              onChange={(e) => handleInputChange("healthNotes", e.target.value)}
              placeholder="Any relevant health conditions or medical needs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastOnlineActivity">Last Online Activity</Label>
            <Textarea
              id="lastOnlineActivity"
              value={formData.lastOnlineActivity}
              onChange={(e) => handleInputChange("lastOnlineActivity", e.target.value)}
              placeholder="Last known online activity, device tracking info"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveredBelongings">Recovered Belongings</Label>
            <Textarea
              id="recoveredBelongings"
              value={formData.recoveredBelongings}
              onChange={(e) => handleInputChange("recoveredBelongings", e.target.value)}
              placeholder="Phone, bag, vehicle, documents, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knownRoutes">Known Routes & Hangout Spots</Label>
            <Textarea
              id="knownRoutes"
              value={formData.knownRoutes}
              onChange={(e) => handleInputChange("knownRoutes", e.target.value)}
              placeholder="Places they frequently visit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communityContacts">Community Contacts</Label>
            <Textarea
              id="communityContacts"
              value={formData.communityContacts}
              onChange={(e) => handleInputChange("communityContacts", e.target.value)}
              placeholder="Community groups or volunteers involved"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cctvFootageInfo">CCTV Footage Information</Label>
            <Textarea
              id="cctvFootageInfo"
              value={formData.cctvFootageInfo}
              onChange={(e) => handleInputChange("cctvFootageInfo", e.target.value)}
              placeholder="Any CCTV footage details or suspected vehicle/person observed"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Submit Report
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          * All information will be handled with care and shared responsibly with authorities and community volunteers.
        </p>
      </form>
    </div>
  );
};
