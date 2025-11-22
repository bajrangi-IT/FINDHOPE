import { FileText, Database, Bell, RefreshCw } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Report the Case",
      description: "Family or friends submit detailed information about the missing person through our secure form.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Database,
      title: "System Organizes",
      description: "Our platform categorizes and displays the case with smart tags, priority levels, and location data.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Bell,
      title: "Community Alerts",
      description: "Volunteers, NGOs, and authorities in the area receive instant notifications about new cases.",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: RefreshCw,
      title: "Status Updates",
      description: "Real-time updates keep everyone informed as the search progresses and the case develops.",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How FindHope Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, effective process to mobilize communities and bring missing persons home safely
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative glass-card p-6 rounded-2xl animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Number */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`${step.bgColor} ${step.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4`}>
                <step.icon className="w-8 h-8" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>

              {/* Connector Line (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
