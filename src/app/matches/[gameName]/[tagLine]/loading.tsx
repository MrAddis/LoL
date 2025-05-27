
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Loading() {
  return (
    <div className="container mx-auto px-2 py-4 md:py-8 max-w-6xl">
      <header className="mb-6 md:mb-8 flex justify-between items-center">
         <Link href="/" aria-label="Back to Home">
          <Logo />
        </Link>
        <Button asChild variant="outline" size="sm" disabled>
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> New Search
          </Link>
        </Button>
      </header>

      {/* Player Summary Skeleton */}
      <div className="flex items-center gap-4 p-4 md:p-6 bg-card rounded-lg shadow-lg mb-6 md:mb-8">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-col items-center justify-center ml-auto pl-4">
          <Skeleton className="h-16 w-16 rounded-full" /> 
          <Skeleton className="h-5 w-20 mt-1" />
        </div>
      </div>

      {/* Match List Skeleton */}
      <div className="space-y-3 md:space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 md:p-4 bg-card rounded-lg shadow-md flex flex-col md:flex-row items-center gap-3 md:gap-4 border-l-4 border-muted">
            {/* Left section skeleton */}
            <div className="flex flex-col items-center gap-2 w-24 md:w-28">
              <Skeleton className="h-16 w-16 rounded" />
              <div className="flex gap-1">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-px w-full md:h-20 md:w-px bg-border my-2 md:my-0" />
            {/* Center section skeleton */}
            <div className="flex flex-col items-center justify-center gap-1 flex-grow">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="h-[30px] w-[30px] rounded" />
                ))}
              </div>
              <Skeleton className="h-[24px] w-[24px] rounded mt-1" />
            </div>
            <Skeleton className="h-px w-full md:h-20 md:w-px bg-border my-2 md:my-0" />
            {/* Right section skeleton */}
            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto text-center md:text-right">
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-7 w-32 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-5 w-28 rounded" />
              <div className="flex gap-1 mt-2 justify-center md:justify-end">
                {[...Array(4)].map((_, k) => (
                  <Skeleton key={k} className="h-6 w-6 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
