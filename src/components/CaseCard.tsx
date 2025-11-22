import { MissingCase } from "@/types/case";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, AlertCircle } from "lucide-react";

interface CaseCardProps {
  caseData: MissingCase;
  onClick: () => void;
}

export const CaseCard = ({ caseData, onClick }: CaseCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "found":
        return "bg-success text-success-foreground";
      case "active":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const daysSinceReport = Math.floor(
    (new Date().getTime() - new Date(caseData.reportedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={onClick}
      className="glass-card rounded-xl overflow-hidden cursor-pointer hover:glass-elevated transition-all duration-300 hover:scale-[1.02] group animate-fade-in-up"
    >
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {caseData.photoUrl ? (
          <img
            src={caseData.photoUrl}
            alt={caseData.fullName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={getPriorityColor(caseData.priority)}>
            {caseData.priority === "high" ? "High Priority" : "Priority"}
          </Badge>
          <Badge className={getStatusColor(caseData.status)}>
            {caseData.status === "found" ? "Found" : caseData.status === "active" ? "Active" : "Cold Case"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-xl font-bold mb-1">{caseData.fullName}</h3>
          <p className="text-sm text-muted-foreground">
            {caseData.age} years old • {caseData.gender}
          </p>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground line-clamp-1">{caseData.lastSeenLocation}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {daysSinceReport === 0 ? "Today" : `${daysSinceReport} days ago`}
          </span>
        </div>

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">Case ID: {caseData.id}</p>
        </div>
      </div>
    </div>
  );
};
