import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, Upload } from "lucide-react";

const AccidentReportForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    accidentType: "road",
    hospitalName: "",
    hospitalLocation: "",
    policeStation: "",
    injuryDescription: "",
    clothesDescription: "",
    physicalMarks: "",
    reporterName: "",
    reporterContact: "",
    lastSeenDate: "",
    lastSeenTime: "",
  });
  
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: caseData, error } = await supabase.from("cases").insert({
        case_type: "unknown_accident",
        full_name: formData.fullName || "Unknown",
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        accident_type: formData.accidentType,
        hospital_name: formData.hospitalName,
        hospital_location: formData.hospitalLocation,
        police_station: formData.policeStation,
        injury_description: formData.injuryDescription,
        clothes_description: formData.clothesDescription,
        physical_marks: formData.physicalMarks,
        reporter_name: formData.reporterName,
        reporter_contact: formData.reporterContact,
        last_seen_date: formData.lastSeenDate,
        last_seen_time: formData.lastSeenTime,
        photo_url: photoPreview,
        status: "active",
        priority: "high",
        user_id: session?.user?.id || null,
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

      // Check for potential matches with missing person reports
      try {
        const { data: matchData } = await supabase.functions.invoke('check-case-matches', {
          body: { caseId: caseData.id, caseType: "unknown_accident" }
        });

        if (matchData?.matchCount > 0) {
          toast.success(
            `Accident report submitted successfully! ⚠️ We found ${matchData.matchCount} potential missing person match(es) that might be related. Please check the case details.`,
            { duration: 8000 }
          );
        } else {
          toast.success("Unknown person accident report submitted successfully!");
        }
      } catch (matchError) {
        console.error("Error checking matches:", matchError);
        toast.success("Unknown person accident report submitted successfully!");
      }
      
      // Reset form
      setFormData({
        fullName: "",
        age: "",
        gender: "Male",
        accidentType: "road",
        hospitalName: "",
        hospitalLocation: "",
        policeStation: "",
        injuryDescription: "",
        clothesDescription: "",
        physicalMarks: "",
        reporterName: "",
        reporterContact: "",
        lastSeenDate: "",
        lastSeenTime: "",
      });
      setPhotoPreview("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="accident-report" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/20 mb-4">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Report Unknown Person Accident
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help us identify unknown individuals involved in accidents. Your report could help reunite families.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Name (if known)</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Unknown if not identified"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Approximate Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Estimated age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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
              <Label htmlFor="accidentType">Accident Type</Label>
              <Select value={formData.accidentType} onValueChange={(value) => handleInputChange("accidentType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road Accident</SelectItem>
                  <SelectItem value="fire">Fire Accident</SelectItem>
                  <SelectItem value="drowning">Drowning</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name*</Label>
              <Input
                id="hospitalName"
                value={formData.hospitalName}
                onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                placeholder="Name of hospital"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalLocation">Hospital Location*</Label>
              <Input
                id="hospitalLocation"
                value={formData.hospitalLocation}
                onChange={(e) => handleInputChange("hospitalLocation", e.target.value)}
                placeholder="City, area"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policeStation">Police Station</Label>
              <Input
                id="policeStation"
                value={formData.policeStation}
                onChange={(e) => handleInputChange("policeStation", e.target.value)}
                placeholder="Nearest police station"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastSeenDate">Date of Accident*</Label>
              <Input
                id="lastSeenDate"
                type="date"
                value={formData.lastSeenDate}
                onChange={(e) => handleInputChange("lastSeenDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="injuryDescription">Injury Description</Label>
              <Textarea
                id="injuryDescription"
                value={formData.injuryDescription}
                onChange={(e) => handleInputChange("injuryDescription", e.target.value)}
                placeholder="Describe visible injuries"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clothesDescription">Clothes Description</Label>
              <Textarea
                id="clothesDescription"
                value={formData.clothesDescription}
                onChange={(e) => handleInputChange("clothesDescription", e.target.value)}
                placeholder="Describe clothing worn"
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="physicalMarks">Physical Marks/Features</Label>
              <Textarea
                id="physicalMarks"
                value={formData.physicalMarks}
                onChange={(e) => handleInputChange("physicalMarks", e.target.value)}
                placeholder="Birthmarks, tattoos, scars, etc."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterName">Your Name*</Label>
              <Input
                id="reporterName"
                value={formData.reporterName}
                onChange={(e) => handleInputChange("reporterName", e.target.value)}
                placeholder="Reporter's name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterContact">Your Contact*</Label>
              <Input
                id="reporterContact"
                value={formData.reporterContact}
                onChange={(e) => handleInputChange("reporterContact", e.target.value)}
                placeholder="Phone or email"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="photo">Photo (if available)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              {photoPreview && (
                <div className="mt-4">
                  <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Accident Report"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default AccidentReportForm;