import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MissingCase } from "@/types/case";
import { CaseCard } from "@/components/CaseCard";
import { CaseModal } from "@/components/CaseModal";
import { Search, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchSectionProps {
  cases: MissingCase[];
}

export const SearchSection = ({ cases }: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCases, setFilteredCases] = useState<MissingCase[]>(cases);
  const [selectedCase, setSelectedCase] = useState<MissingCase | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    children: false,
    teens: false,
    adults: false,
    elderly: false,
    recent: false,
  });

  useEffect(() => {
    let results = [...cases];

    // Search filter
    if (searchQuery) {
      results = results.filter(
        (c) =>
          c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Age filters
    if (filters.children) results = results.filter((c) => c.age < 15);
    if (filters.teens) results = results.filter((c) => c.age >= 15 && c.age < 20);
    if (filters.adults) results = results.filter((c) => c.age >= 20 && c.age < 60);
    if (filters.elderly) results = results.filter((c) => c.age >= 60);

    // Recent filter
    if (filters.recent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      results = results.filter((c) => new Date(c.reportedDate) >= sevenDaysAgo);
    }

    setFilteredCases(results);
  }, [searchQuery, filters, cases]);

  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Search Missing Persons</h2>
        <p className="text-lg text-muted-foreground">
          Use smart filters to find cases and help bring someone home
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or case ID..."
            className="pl-12 h-14 text-lg glass-card"
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center mb-8">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="glass-card"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="max-w-2xl mx-auto mb-8 glass-card p-6 rounded-xl animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="children"
                checked={filters.children}
                onCheckedChange={() => handleFilterChange("children")}
              />
              <Label htmlFor="children" className="cursor-pointer">
                Children (0-14)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="teens"
                checked={filters.teens}
                onCheckedChange={() => handleFilterChange("teens")}
              />
              <Label htmlFor="teens" className="cursor-pointer">
                Teens (15-19)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="adults"
                checked={filters.adults}
                onCheckedChange={() => handleFilterChange("adults")}
              />
              <Label htmlFor="adults" className="cursor-pointer">
                Adults (20-59)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="elderly"
                checked={filters.elderly}
                onCheckedChange={() => handleFilterChange("elderly")}
              />
              <Label htmlFor="elderly" className="cursor-pointer">
                Elderly (60+)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recent"
                checked={filters.recent}
                onCheckedChange={() => handleFilterChange("recent")}
              />
              <Label htmlFor="recent" className="cursor-pointer">
                Last 7 Days
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-center mb-6 text-muted-foreground">
        {filteredCases.length} {filteredCases.length === 1 ? "case" : "cases"} found
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseData) => (
          <CaseCard
            key={caseData.id}
            caseData={caseData}
            onClick={() => setSelectedCase(caseData)}
          />
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No cases match your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Case Modal */}
      {selectedCase && (
        <CaseModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          similarCases={cases.filter(
            (c) =>
              c.id !== selectedCase.id &&
              (Math.abs(c.age - selectedCase.age) <= 5 ||
                c.lastSeenLocation
                  .toLowerCase()
                  .includes(selectedCase.lastSeenLocation.toLowerCase().split(",")[0]))
          ).slice(0, 3)}
        />
      )}
    </div>
  );
};
