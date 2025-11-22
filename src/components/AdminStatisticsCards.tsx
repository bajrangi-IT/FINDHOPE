import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, FileText } from "lucide-react";

interface Statistics {
  totalCases: number;
  activeCases: number;
  foundCases: number;
  avgResolutionTime: string;
}

const AdminStatisticsCards = () => {
  const [stats, setStats] = useState<Statistics>({
    totalCases: 0,
    activeCases: 0,
    foundCases: 0,
    avgResolutionTime: "0 days"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();

    // Subscribe to realtime changes on cases table
    const channel = supabase
      .channel('cases-statistics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases'
        },
        () => {
          // Refetch statistics when any case changes
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data: cases, error } = await supabase
        .from("cases")
        .select("status, created_at, updated_at");

      if (error) throw error;

      const totalCases = cases?.length || 0;
      const activeCases = cases?.filter(c => c.status === "active").length || 0;
      const foundCases = cases?.filter(c => c.status === "found").length || 0;

      // Calculate average resolution time for found cases
      const foundCasesWithDates = cases?.filter(c => c.status === "found" && c.created_at && c.updated_at) || [];
      let avgResolutionTime = "0 days";

      if (foundCasesWithDates.length > 0) {
        const totalDays = foundCasesWithDates.reduce((sum, c) => {
          const created = new Date(c.created_at).getTime();
          const updated = new Date(c.updated_at).getTime();
          const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        
        const avgDays = Math.round(totalDays / foundCasesWithDates.length);
        avgResolutionTime = `${avgDays} ${avgDays === 1 ? 'day' : 'days'}`;
      }

      setStats({
        totalCases,
        activeCases,
        foundCases,
        avgResolutionTime
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Active Cases",
      value: stats.activeCases,
      icon: Activity,
      color: "text-orange-600"
    },
    {
      title: "Found Cases",
      value: stats.foundCases,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Avg Resolution Time",
      value: stats.avgResolutionTime,
      icon: Clock,
      color: "text-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStatisticsCards;
