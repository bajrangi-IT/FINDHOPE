import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Heart, Shield, CheckCircle } from "lucide-react";

export const CommunitySection = () => {
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    phone: "",
    role: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for volunteering!", {
      description: "We'll notify you about cases in your area.",
      icon: <Heart className="text-success" />,
    });
    setFormData({ name: "", area: "", phone: "", role: "" });
  };

  const volunteers = [
    { name: "John Martinez", area: "New York", role: "Search Volunteer" },
    { name: "Sarah Lee", area: "Los Angeles", role: "NGO Partner" },
    { name: "Michael Brown", area: "Chicago", role: "Community Lead" },
  ];

  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
        <p className="text-lg text-muted-foreground">
          Become a volunteer and help make a difference in someone's life
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="glass-elevated p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-6">Volunteer Registration</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vol-name">Full Name *</Label>
              <Input
                id="vol-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vol-area">Area / City *</Label>
              <Input
                id="vol-area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Your city or area"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vol-phone">Phone Number *</Label>
              <Input
                id="vol-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vol-role">Preferred Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Search Volunteer</SelectItem>
                  <SelectItem value="ngo">NGO Partner</SelectItem>
                  <SelectItem value="police">Law Enforcement</SelectItem>
                  <SelectItem value="medical">Medical Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Register as Volunteer
            </Button>
          </form>
        </div>

        {/* Info & Active Volunteers */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Why Volunteer?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <span>Receive instant alerts about missing persons in your area</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <span>Join organized community search efforts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <span>Make a real difference in bringing families together</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <span>Connect with NGOs and law enforcement</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Active Volunteers
            </h3>
            <div className="space-y-3">
              {volunteers.map((volunteer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                    {volunteer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{volunteer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {volunteer.area} • {volunteer.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
