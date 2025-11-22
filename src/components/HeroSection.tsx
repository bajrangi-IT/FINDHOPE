import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";
interface HeroSectionProps {
  setActiveSection: (section: string) => void;
}
export const HeroSection = ({
  setActiveSection
}: HeroSectionProps) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };
  return <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{
        animationDelay: "1s"
      }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-600">
            Every Second Counts













            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text font-extrabold font-mono text-red-800">
              Help Bring Them Home
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A compassionate platform connecting communities, families, and authorities 
            to find missing loved ones faster through technology and collective action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" onClick={() => scrollToSection("report")} className="min-w-[200px] h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <FileText className="w-5 h-5 mr-2" />
              Report Missing Person
            </Button>
            
            <Button size="lg" variant="outline" onClick={() => scrollToSection("search")} className="min-w-[200px] h-14 text-lg glass-card hover:glass-elevated transition-all">
              <Search className="w-5 h-5 mr-2" />
              Search Database
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            Join <span className="text-primary font-semibold">1,000+</span> volunteers making a difference
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full p-1">
          <div className="w-1.5 h-3 bg-primary rounded-full mx-auto animate-glow" />
        </div>
      </div>
    </div>;
};