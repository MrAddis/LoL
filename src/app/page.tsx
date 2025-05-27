
import { SearchBarClient } from '@/components/search-bar-client';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-transparent">
      <header className="mb-12">
        <Logo />
      </header>

      <section className="w-full max-w-2xl mb-16"> {/* Increased margin-bottom */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">
          Uncover Player Stats
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Enter a Riot ID to view detailed match history and performance insights for any League of Legends player on EUW.
        </p>
        <SearchBarClient />
      </section>

      <section className="w-full max-w-4xl mt-96 mb-12"> {/* Added large margin-top */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center md:items-stretch">
          {/* Column 1 */}
          <div className="flex flex-col gap-6 md:gap-8 flex-1">
            {/* AI Coach Card */}
            <Card className="flex-1 bg-card/80 border-border shadow-lg overflow-hidden flex flex-col max-w-lg mx-auto md:mx-0">
              <Image
                src="https://i.postimg.cc/50yNv0qf/Foto1.png"
                alt="AI Coach Promotion"
                width={400}
                height={400}
                className="w-full h-auto object-cover aspect-square"
                data-ai-hint="esports trophy celebration"
              />
              <CardContent className="p-6 text-center flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">
                    Get help with the new AI Coach!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    Unlock personalized insights and strategies to elevate your game.
                  </CardDescription>
                </div>
                {/* Placeholder for a button or link to the AI Coach page */}
                {/* <Button variant="default" size="lg" asChild>
                  <Link href="/ai-coach">Try Coach AI</Link>
                </Button> */}
              </CardContent>
            </Card>

            {/* Watch Stats Card */}
            <Card className="flex-1 bg-card/80 border-border shadow-lg overflow-hidden flex flex-col max-w-lg mx-auto md:mx-0">
              <Image
                src="https://i.postimg.cc/MHRhC2bC/Chat-GPT-Image-May-27-2025-10-21-16-PM.png"
                alt="Watch Stats Promotion"
                width={400}
                height={400}
                className="w-full h-auto object-cover aspect-square"
                data-ai-hint="data analysis chart"
              />
              <CardContent className="p-6 text-center flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">
                    Watch and understand your statistics!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    Dive deep into your performance metrics and identify areas for improvement.
                  </CardDescription>
                </div>
                 {/* Placeholder for a button or link */}
                {/* <Button variant="default" size="lg" asChild>
                  <Link href="/player-stats">View Your Stats</Link>
                </Button> */}
              </CardContent>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6 md:gap-8 flex-1">
            <Card className="flex-1 bg-card/80 border-border shadow-lg overflow-hidden flex flex-col max-w-lg mx-auto md:mx-0">
              <Image
                src="https://i.postimg.cc/L6QX9jzN/Chat-GPT-Image-May-27-2025-10-08-09-PM.png"
                alt="Squad Score Promotion"
                width={400}
                height={400}
                className="w-full h-auto object-cover aspect-square"
                data-ai-hint="team score graph"
              />
              <CardContent className="p-6 text-center flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">
                    See the score of your squad!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    Analyze your team's performance and climb the ranks together.
                  </CardDescription>
                </div>
                 {/* Placeholder for a button or link */}
                {/* <Button variant="default" size="lg" asChild>
                  <Link href="/squad-scores">View Squad Scores</Link>
                </Button> */}
              </CardContent>
            </Card>

            {/* New Updates Card */}
            <Card className="flex-1 bg-card/80 border-border shadow-lg overflow-hidden flex flex-col max-w-lg mx-auto md:mx-0">
              <Image
                src="https://i.postimg.cc/9Qtc4T96/Chat-GPT-Image-May-27-2025-10-40-19-PM.png"
                alt="Game Updates Promotion"
                width={400}
                height={400}
                className="w-full h-auto object-cover aspect-square"
                data-ai-hint="notification bell"
              />
              <CardContent className="p-6 text-center flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">
                    Get constantly updated on your games!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    Stay informed with the latest match results and performance changes.
                  </CardDescription>
                </div>
                 {/* Placeholder for a button or link */}
                {/* <Button variant="default" size="lg" asChild>
                  <Link href="/game-updates">See Updates</Link>
                </Button> */}
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      <footer className="mt-auto pt-8 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LoL Insights. Not affiliated with Riot Games.</p>
        <p className="mt-1">Data provided by Riot Games API.</p>
      </footer>
    </div>
  );
}
