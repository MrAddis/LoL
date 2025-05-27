
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send, ArrowLeft } from 'lucide-react';
import { getLolCoachResponse, type LolCoachInput, type LolCoachOutput } from '@/ai/flows/lol-coach-flow';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AiCoachPage() {
  const params = useParams();
  const gameName = typeof params.gameName === 'string' ? decodeURIComponent(params.gameName) : '';
  const tagLine = typeof params.tagLine === 'string' ? decodeURIComponent(params.tagLine) : '';

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    // Initial greeting message from the AI
    setMessages([
      {
        id: 'initial-greeting',
        role: 'model',
        content: `Hello Summoner! I'm Coach Gemini. How can I help you improve your League of Legends game today? Feel free to ask about builds, strategies, or specific matchups for ${gameName}#${tagLine}!`
      }
    ]);
  }, [gameName, tagLine]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: inputValue,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const input: LolCoachInput = { userMessage: userMessage.content };
      const result: LolCoachOutput = await getLolCoachResponse(input);
      
      const aiMessage: Message = {
        id: Date.now().toString() + '-model',
        role: 'model',
        content: result.coachResponse,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error getting AI coach response:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        role: 'model',
        content: 'Sorry, I had trouble connecting to my knowledge base. Please try again in a moment.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const overviewPath = `/matches/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="container mx-auto max-w-5xl px-4 py-3 flex justify-between items-center border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to Home">
            <Logo />
          </Link>
        </div>
        <h1 className="text-xl font-bold text-primary">LoL AI Coach</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={overviewPath}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Overview
          </Link>
        </Button>
      </header>

      <main className="flex-grow container mx-auto max-w-3xl w-full p-4 flex flex-col">
        <ScrollArea className="flex-grow mb-4 p-3 border border-border rounded-lg bg-card">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 my-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="https://placehold.co/40x40/7E57C2/FFFFFF.png?text=AI" alt="AI Coach" data-ai-hint="robot face" />
                  <AvatarFallback><Bot size={20}/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-lg shadow ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                 <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={`https://placehold.co/40x40/1E88E5/FFFFFF.png?text=${gameName ? gameName.substring(0,1).toUpperCase() : 'U'}`} alt="User" data-ai-hint="user generic" />
                  <AvatarFallback><User size={20}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Coach Gemini about your game..."
            className="flex-grow h-10"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading} className="h-10 w-10">
            {isLoading ? (
              <Bot className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
         <p className="text-xs text-muted-foreground mt-2 text-center">
            Coach Gemini may provide inaccurate information. Verify critical details.
          </p>
      </main>
    </div>
  );
}
