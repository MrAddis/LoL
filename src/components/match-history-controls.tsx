
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import * as React from "react";

interface MatchHistoryControlsProps {
  championFilterValue: string;
  onChampionFilterChange: (value: string) => void;
  matchTypeValue: string;
  onMatchTypeChange: (value: string) => void;
}

export function MatchHistoryControls({
  championFilterValue,
  onChampionFilterChange,
  matchTypeValue,
  onMatchTypeChange,
}: MatchHistoryControlsProps) {
  
  const getDisplayMatchType = (value: string) => {
    switch (value) {
      case "all": return "All Matches";
      case "ranked_solo": return "Ranked Solo";
      case "ranked_flex": return "Ranked Flex";
      case "normal": return "Normal";
      case "aram": return "ARAM";
      default: return "All Matches";
    }
  };

  return (
    <div className="mb-3 p-2.5 bg-slate-800 border border-slate-700 rounded-md shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-md font-semibold text-slate-200 hidden sm:block">Match History</h2>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="text-[0.7rem] h-8 bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300 hover:text-slate-100 w-full sm:w-auto justify-between px-2.5"
              >
                {getDisplayMatchType(matchTypeValue)}
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
              <DropdownMenuRadioGroup value={matchTypeValue} onValueChange={onMatchTypeChange}>
                <DropdownMenuRadioItem value="all" className="text-xs focus:bg-slate-700">All Matches</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ranked_solo" className="text-xs focus:bg-slate-700">Ranked Solo</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ranked_flex" className="text-xs focus:bg-slate-700">Ranked Flex</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="normal" className="text-xs focus:bg-slate-700">Normal</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="aram" className="text-xs focus:bg-slate-700">ARAM</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
            <Input
              type="search"
              placeholder="Search Champion..."
              value={championFilterValue}
              onChange={(e) => onChampionFilterChange(e.target.value)}
              className="h-8 text-[0.7rem] pl-7 bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-200 focus:bg-slate-600"
            />
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
