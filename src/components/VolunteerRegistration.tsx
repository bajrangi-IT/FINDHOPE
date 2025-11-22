import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VolunteerRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    area: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to register as a volunteer");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("volunteers").insert({
      user_id: user.id,
      full_name: formData.fullName,
      phone: formData.phone,
      area: formData.area,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to register as volunteer");
      console.error(error);
    } else {
      toast.success("Successfully registered as a volunteer!");
      setTimeout(() => {
        navigate("/volunteer-dashboard");
      }, 1000);
    }
    setLoading(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success("Location captured successfully");
        },
        () => {
          toast.error("Unable to get your location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Register as Volunteer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">
            <MapPin className="w-4 h-4 inline mr-2" />
            Area/Location
          </Label>
          <Input
            id="area"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (Optional)</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (Optional)</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>
        </div>

        <Button type="button" variant="outline" onClick={getCurrentLocation}>
          <MapPin className="w-4 h-4 mr-2" />
          Use Current Location
        </Button>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering..." : "Register as Volunteer"}
        </Button>
      </form>
    </div>
  );
};

export default VolunteerRegistration;