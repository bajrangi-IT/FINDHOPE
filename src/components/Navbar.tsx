import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navbar = ({ activeSection, setActiveSection }: NavbarProps) => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "search", label: "Search" },
    { id: "report", label: "Report" },
    { id: "accident-report", label: "Accident Report" },
    { id: "community", label: "Community" },
    { id: "about", label: "About" },
  ];

  const externalLinks = [
    { path: "/photo-search", label: "Photo Search" },
    { path: "/volunteer", label: "Volunteer" },
    { path: "/auth", label: "Login" },
    { path: "/admin", label: "Admin" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-elevated shadow-lg py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white">
              FH
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FindHope
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Button
                key={link.id}
                variant="ghost"
                onClick={() => scrollToSection(link.id)}
                className={`transition-colors ${
                  activeSection === link.id
                    ? "text-primary font-semibold"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {externalLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button variant="outline" size="sm">
                  {link.label === "Admin" && <Shield className="w-4 h-4 mr-2" />}
                  {link.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 glass-card rounded-xl p-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Button
                  key={link.id}
                  variant="ghost"
                  onClick={() => scrollToSection(link.id)}
                  className={`justify-start ${
                    activeSection === link.id
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
