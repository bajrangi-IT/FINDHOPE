import { Shield, Heart, Users } from "lucide-react";

export const AboutSection = () => {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">About FindHope</h2>
        <p className="text-lg text-muted-foreground">
          Our mission, values, and commitment to bringing families together
        </p>
      </div>

      <div className="glass-elevated p-8 md:p-12 rounded-2xl space-y-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Our Mission
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            FindHope is a community-driven platform designed to accelerate the search for missing persons 
            by connecting families, volunteers, NGOs, and law enforcement through technology. Every minute 
            matters when someone goes missing, and we're here to make those minutes count.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Privacy & Ethics
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            We take privacy and data security seriously. All information is encrypted and shared responsibly 
            with verified volunteers and authorities. This platform is designed to assist, not replace, 
            official law enforcement efforts. We encourage all users to file official reports with local police.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Community First
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            FindHope works because of people like you. Our volunteers span across cities, forming a network 
            of compassionate individuals ready to help. Together, we can make our communities safer and 
            bring hope to families in their darkest hours.
          </p>
        </div>

        <div className="pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Important:</strong> This is a demonstration platform. In real emergencies, always contact 
            local law enforcement immediately. In the US, call 911 or the National Missing Persons Hotline: 
            1-800-THE-LOST (1-800-843-5678).
          </p>
        </div>
      </div>
    </div>
  );
};
