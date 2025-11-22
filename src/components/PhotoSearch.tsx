import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Match {
  id: string;
  full_name: string;
  photo_url: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  clothes_description: string;
  physical_marks: string;
  reward_amount: number;
  confidence_score: number;
}

const PhotoSearch = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error("Please upload a photo first");
      return;
    }

    setLoading(true);
    try {
      // First check if there are any active cases
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("id")
        .eq("case_type", "missing")
        .eq("status", "active")
        .not("photo_url", "is", null)
        .limit(1);

      if (casesError) throw casesError;

      if (!casesData || casesData.length === 0) {
        toast.error("No active missing person cases with photos in database. Please add cases first.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("match-photo", {
        body: { imageUrl: selectedImage },
      });

      if (error) throw error;

      setMatches(data.matches || []);
      
      if (data.matches?.length === 0) {
        toast.info("No matches found. Try a different photo or check case database.");
      } else {
        toast.success(`Found ${data.matches.length} potential match(es)`);
      }
    } catch (error: any) {
      console.error("Error matching photo:", error);
      toast.error(error.message || "Failed to search for matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Photo Search</h2>
        <p className="text-muted-foreground">
          Upload a photo to find matching missing persons using AI
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-md">
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
                </div>
              )}
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!selectedImage || loading}
            size="lg"
            className="w-full max-w-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search for Matches
              </>
            )}
          </Button>
        </div>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Potential Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <img
                  src={match.photo_url}
                  alt={match.full_name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">{match.full_name}</h4>
                    <Badge
                      variant={
                        match.confidence_score >= 80
                          ? "default"
                          : match.confidence_score >= 60
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {match.confidence_score}% match
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {match.age} years • {match.gender}
                    </p>
                    <p>Last seen: {match.last_seen_location}</p>
                    <p>Date: {match.last_seen_date}</p>
                    {match.reward_amount > 0 && (
                      <p className="text-primary font-semibold">
                        Reward: ₹{match.reward_amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/?case=${match.id}`}>View Full Details</a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoSearch;
