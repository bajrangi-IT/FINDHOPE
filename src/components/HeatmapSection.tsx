import { MissingCase } from "@/types/case";
import { MapPin } from "lucide-react";

interface HeatmapSectionProps {
  cases: MissingCase[];
}

export const HeatmapSection = ({ cases }: HeatmapSectionProps) => {
  // Simulate heatmap data by location
  const locationCounts: { [key: string]: number } = {};
  
  cases.forEach((caseData) => {
    const city = caseData.lastSeenLocation.split(",")[0].trim();
    locationCounts[city] = (locationCounts[city] || 0) + 1;
  });

  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">High-Risk Areas</h2>
          <p className="text-lg text-muted-foreground">
            Geographic distribution of recent missing person cases
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Simulated Map */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            
            {/* Simulated map markers */}
            <div className="relative h-full flex items-center justify-center">
              <div className="grid grid-cols-3 gap-12 w-full max-w-lg">
                {topLocations.map(([location, count], index) => (
                  <div
                    key={location}
                    className="flex flex-col items-center animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: `${Math.min(100 + count * 20, 200)}px`,
                        height: `${Math.min(100 + count * 20, 200)}px`,
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-primary/20 rounded-full animate-glow"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                      <div className="relative bg-primary text-primary-foreground rounded-full p-4 shadow-lg">
                        <MapPin className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold mt-2 text-center">{location}</p>
                    <p className="text-xs text-muted-foreground">{count} cases</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Area Statistics</h3>
              <div className="space-y-3">
                {topLocations.map(([location, count], index) => (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(217, 91%, ${60 - index * 10}%)`,
                        }}
                      />
                      <span className="text-sm">{location}</span>
                    </div>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">Legend</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Circle size indicates case density</p>
                <p>• Larger circles = more cases</p>
                <p>• Updated in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
