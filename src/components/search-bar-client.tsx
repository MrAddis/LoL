"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SearchBarClient() {
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!riotId.includes('#')) {
      toast({
        title: "Invalid Riot ID",
        description: "Please enter a valid Riot ID in the format Name#Tag.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const [gameName, tagLine] = riotId.split('#');

    try {
      // The match history page itself will handle fetching and displaying errors
      // This component just navigates.
      // A pre-flight check to /api/summoner could be done here to validate player exists
      // before navigation, but for simplicity, we navigate directly.
      // The target page will show "Player not found" if needed.
      router.push(`/matches/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description: "Could not initiate search. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // setIsLoading(false) will be handled by navigation or if an error occurs before navigation
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter Riot ID (e.g., YourName#EUW)"
        value={riotId}
        onChange={(e) => setRiotId(e.target.value)}
        className="flex-grow text-base md:text-lg h-12"
        disabled={isLoading}
        aria-label="Riot ID Search Input"
      />
      <Button type="submit" size="lg" className="h-12" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
      </Button>
    </form>
  );
}
