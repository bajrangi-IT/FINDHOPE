import { useEffect, useState, useRef } from "react";
import { MissingCase } from "@/types/case";
import { Users, Search, CheckCircle } from "lucide-react";

interface StatsSectionProps {
  cases: MissingCase[];
}

export const StatsSection = ({ cases }: StatsSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const totalCases = cases.length;
  const foundCases = cases.filter(c => c.status === "found").length;
  const activeCases = cases.filter(c => c.status === "active").length;

  const stats = [
    {
      icon: Users,
      label: "Total Cases",
      value: totalCases,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Search,
      label: "Active Searches",
      value: activeCases,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: CheckCircle,
      label: "Cases Resolved",
      value: foundCases,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div ref={sectionRef} className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              isVisible={isVisible}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  isVisible: boolean;
  delay: number;
}

const StatCard = ({ icon: Icon, label, value, color, bgColor, isVisible, delay }: StatCardProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      className="glass-card p-8 rounded-2xl animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center space-x-4">
        <div className={`${bgColor} ${color} p-4 rounded-xl`}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <div className={`text-4xl font-bold ${color}`}>{count}</div>
          <div className="text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
};
