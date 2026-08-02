"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Search, Bot, FileText, Send, User } from "lucide-react";

export function ProductPreview() {
  return (
    <section className="py-24 relative overflow-hidden bg-card/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <SectionHeader 
          title="Experience the Future of Knowledge"
          description="A seamless, beautiful interface designed for productivity."
        />
        
        <AnimatedContainer animation="slide-up" delay={0.2} className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden relative glow-primary">
            {/* Mac OS Window Controls */}
            <div className="h-10 border-b border-border bg-card/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="ml-4 flex-1 text-center text-xs text-muted-foreground font-medium flex items-center justify-center gap-2">
                <Search className="w-3 h-3" /> nexusai.dev/chat
              </div>
            </div>
            
            {/* App Layout */}
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-border bg-card/30 p-4 hidden md:flex flex-col gap-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Chats</div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`p-2 rounded-md flex items-center gap-2 text-sm ${i === 1 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>
                    <MessageIcon /> {i === 1 ? 'Q3 Financial Report Analysis' : `Document Chat ${i}`}
                  </div>
                ))}
              </div>
              
              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                <div className="absolute inset-0 bg-background/95"></div>
                
                <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6 relative z-10">
                  {/* User Message */}
                  <div className="flex gap-4 self-end max-w-[80%]">
                    <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-sm">
                      <p className="text-sm">Can you summarize the key findings from the Q3 Financial Report?</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-sm flex flex-col gap-3">
                      <p className="text-sm text-foreground">Based on the uploaded document <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">Q3_Report.pdf</span>, here are the key findings:</p>
                      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                        <li>Revenue increased by 15% year-over-year.</li>
                        <li>Operating margins improved by 200 basis points due to operational efficiencies.</li>
                        <li>The new SaaS product line contributed to 30% of new ARR.</li>
                      </ul>
                      <div className="flex gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs border border-border bg-background rounded-full px-2 py-1 text-muted-foreground">
                          <FileText className="w-3 h-3" /> Page 4
                        </div>
                        <div className="flex items-center gap-1.5 text-xs border border-border bg-background rounded-full px-2 py-1 text-muted-foreground">
                          <FileText className="w-3 h-3" /> Page 7
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Input Area */}
                <div className="p-4 border-t border-border bg-background relative z-10">
                  <div className="relative">
                    <input 
                      type="text" 
                      disabled
                      placeholder="Ask follow-up questions..." 
                      className="w-full bg-card border border-border rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none"
                    />
                    <button disabled className="absolute right-2 top-2 bottom-2 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center mt-2 text-xs text-muted-foreground">
                    NexusAI uses Gemini Pro. Responses may be inaccurate.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}

function MessageIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
}
