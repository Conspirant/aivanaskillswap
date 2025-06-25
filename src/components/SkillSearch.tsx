
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface SkillSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const SkillSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy 
}: SkillSearchProps) => {
  return (
    <div className="backdrop-blur-xl bg-white/10 border border-yellow-500/20 rounded-3xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
          <Input
            placeholder="Search skills, location, or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400 focus:border-yellow-500 rounded-xl"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-yellow-400" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-yellow-500/30 text-white">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="karma">Most Karma</SelectItem>
              <SelectItem value="free">Free Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SkillSearch;
