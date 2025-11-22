import { Heart } from "lucide-react";

export const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted/50 border-t border-border/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white">
                FH
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FindHope
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Every second counts. Together, we bring them home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("search")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Search Cases
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("report")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Report Missing
                </button>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("community")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Volunteer
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="font-semibold mb-4">Emergency Contacts</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>US Emergency: 911</li>
              <li>Missing Persons: 1-800-THE-LOST</li>
              <li>NCMEC: 1-800-843-5678</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-destructive fill-current" /> for humanity
            © 2024 FindHope. Demo Platform - Always contact authorities in real emergencies.
          </p>
        </div>
      </div>
    </footer>
  );
};
