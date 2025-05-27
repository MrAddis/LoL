
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bot, User, Send } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoadingAiCoachPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="container mx-auto max-w-5xl px-4 py-3 flex justify-between items-center border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to Home">
            <Logo />
          </Link>
        </div>
        <h1 className="text-xl font-bold text-primary">LoL AI Coach</h1>
        <Button asChild variant="outline" size="sm" disabled>
          <Link href="#">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Overview
          </Link>
        </Button>
      </header>

      <main className="flex-grow container mx-auto max-w-3xl w-full p-4 flex flex-col">
        <div className="flex-grow mb-4 p-3 border border-border rounded-lg bg-card space-y-6">
          {/* AI Greeting Skeleton */}
          <div className="flex items-start gap-3 my-3 justify-start">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="max-w-[75%] p-3 rounded-lg shadow bg-muted space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* User Message Skeleton Example */}
          <div className="flex items-start gap-3 my-3 justify-end">
            <div className="max-w-[75%] p-3 rounded-lg shadow bg-primary space-y-2">
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
          
          {/* AI Response Skeleton Example */}
           <div className="flex items-start gap-3 my-3 justify-start">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="max-w-[75%] p-3 rounded-lg shadow bg-muted space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
         <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
      </main>
    </div>
  );
}
