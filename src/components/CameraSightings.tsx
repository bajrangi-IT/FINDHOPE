import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Camera } from "lucide-react";

interface Sighting {
  id: string;
  case_id: string;
  camera_location: string;
  latitude: number;
  longitude: number;
  confidence_score: number;
  detected_at: string;
  volunteer_notified: boolean;
  cases: {
    full_name: string;
  };
}

const CameraSightings = () => {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSightings();

    // Subscribe to new sightings
    const channel = supabase
      .channel("camera_sightings_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "camera_sightings",
        },
        () => {
          fetchSightings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSightings = async () => {
    const { data, error } = await supabase
      .from("camera_sightings")
      .select("*, cases(full_name)")
      .order("detected_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Failed to load sightings");
      console.error(error);
    } else {
      setSightings(data as unknown as Sighting[]);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading sightings...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6" />
          CCTV Sightings ({sightings.length})
        </h2>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Missing Person</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Detected At</TableHead>
              <TableHead>Volunteer Notified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sightings.map((sighting) => (
              <TableRow key={sighting.id}>
                <TableCell className="font-medium">
                  {sighting.cases?.full_name || "Unknown"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {sighting.camera_location}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sighting.confidence_score >= 80
                        ? "default"
                        : sighting.confidence_score >= 60
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {sighting.confidence_score}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(sighting.detected_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={sighting.volunteer_notified ? "default" : "outline"}>
                    {sighting.volunteer_notified ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sightings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No CCTV sightings recorded yet
        </div>
      )}
    </div>
  );
};

export default CameraSightings;