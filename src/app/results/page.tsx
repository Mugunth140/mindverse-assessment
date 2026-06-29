"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = ctx.currentTime;
    playNote(523.25, now, 0.4);       // C5
    playNote(659.25, now + 0.1, 0.4); // E5
    playNote(783.99, now + 0.2, 0.4); // G5
    playNote(1046.50, now + 0.3, 0.6);// C6
  } catch (e) {
    console.error("Audio API not supported or blocked", e);
  }
};

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const res = localStorage.getItem("mindverse_results");
    const usr = localStorage.getItem("mindverse_user");
    if (!res || !usr) {
      router.push("/");
      return;
    }
    setResults(JSON.parse(res));
    setUser(JSON.parse(usr));

    // Trigger celebration effects after a tiny delay for render
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22208C', '#C96A28', '#7FAE6D', '#B6A6E5'],
        disableForReducedMotion: true
      });
      playSuccessSound();
    }, 300);
  }, [router]);

  if (!results || !user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <>
      {/* 
        ========================================
        WEB UI (HIDDEN WHEN PRINTING)
        ========================================
      */}
      <div className="min-h-screen bg-brand-ivory pb-20 print:hidden">
        {/* Header */}
        <header className="bg-brand-indigo text-white py-12 px-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Diagnostic Report
              </h1>
              <p className="text-lg text-white/80 max-w-xl">
                Here is the personalized mathematics profile for <span className="font-semibold text-brand-orange">{user.studentName}</span> (Entering Grade {user.gradeLevel}).
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="mt-6 md:mt-0 shadow-lg shadow-black/10"
              onClick={() => window.print()}
            >
              Download Report (PDF)
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 mt-[-40px] relative z-20">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            
            {/* Top Level Summary */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 shadow-xl shadow-brand-indigo/5 border-none">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                  <div className="text-sm font-bold tracking-widest text-brand-charcoal/50 uppercase mb-2">Diagnostic Score</div>
                  <div className="text-7xl font-heading font-black text-brand-indigo mb-2">
                    {results.weightedPct}%
                  </div>
                  <div className={`px-5 py-2 rounded-full text-base font-bold mt-2 ${
                    results.readinessLevel.includes("Ready") ? "bg-brand-green/20 text-brand-green" :
                    results.readinessLevel.includes("Approaching") ? "bg-brand-orange/20 text-brand-orange" :
                    "bg-brand-coral/20 text-brand-coral"
                  }`}>
                    {results.readinessLevel}
                  </div>
                  <p className="text-sm text-brand-charcoal/60 mt-4 max-w-sm">
                    This score is weighted to emphasize critical pre-algebra domains.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl shadow-brand-indigo/5 border-none bg-gradient-to-br from-brand-charcoal to-brand-charcoal/90 text-white">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                  <div className="text-sm font-bold tracking-widest text-white/50 uppercase mb-4">Parent Insights</div>
                  
                  <div className="w-full bg-white/10 rounded-xl p-4 mb-3">
                    <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Learning Habits</div>
                    <div className="text-xl font-heading font-bold">
                      {results.habits >= 20 ? "Strong" : results.habits >= 14 ? "Developing" : "Building"}
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-xl p-4">
                    <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Confidence</div>
                    <div className="text-xl font-heading font-bold">
                      {results.confidence >= 20 ? "High" : results.confidence >= 14 ? "Emerging" : "Growing"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Domain Breakdown */}
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Domain Mastery Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(results.domainScores || {}).map(([domain, score]: [string, any]) => {
                      const pct = Math.round((score.correct / score.total) * 100) || 0;
                      return (
                        <div key={domain} className="bg-brand-charcoal/5 p-3 rounded-xl border border-brand-charcoal/5 flex flex-col justify-between">
                          <div className="text-[10px] leading-tight font-bold text-brand-charcoal/70 uppercase mb-2">{domain}</div>
                          <div>
                            <div className="text-xl font-heading font-bold text-brand-charcoal mb-1">{pct}%</div>
                            <div className="h-1.5 w-full bg-brand-charcoal/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${pct >= 80 ? 'bg-brand-green' : pct >= 50 ? 'bg-brand-orange' : 'bg-brand-coral'}`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Strengths and Growth Areas */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-brand-green/20 flex items-center justify-center">
                      <span className="text-brand-green text-sm font-bold">↑</span>
                    </div>
                    <CardTitle className="text-lg">Top Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {results.topStrengths && results.topStrengths.length > 0 ? (
                    <ul className="space-y-2">
                      {results.topStrengths.map((str: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 bg-brand-green/5 p-2 rounded-lg border border-brand-green/10">
                          <div className="w-1 h-1 rounded-full bg-brand-green flex-shrink-0" />
                          <span className="text-sm font-medium text-brand-charcoal/90">{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-brand-charcoal/60 italic">Needs more data to identify concrete strengths.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center">
                      <span className="text-brand-orange text-sm font-bold">↓</span>
                    </div>
                    <CardTitle className="text-lg">Priority Growth Areas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {results.topGrowthAreas && results.topGrowthAreas.length > 0 ? (
                    <ul className="space-y-2">
                      {results.topGrowthAreas.map((area: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 bg-brand-orange/5 p-2 rounded-lg border border-brand-orange/10">
                          <div className="w-1 h-1 rounded-full bg-brand-orange flex-shrink-0" />
                          <span className="text-sm font-medium text-brand-charcoal/90">{area}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-brand-charcoal/60 italic">Great job! No major conceptual gaps identified.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Enrollment CTA */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-brand-indigo bg-brand-indigo/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <CardHeader>
                  <div className="inline-block bg-brand-indigo text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 w-max">
                    Recommended Course
                  </div>
                  <CardTitle className="text-2xl text-brand-indigo">Bridge to Middle School Math</CardTitle>
                  <CardDescription className="text-base text-brand-charcoal/80 max-w-2xl">
                    Turn these diagnostic insights into action! Enroll {user.studentName} in our specialized bootcamp designed to close foundational gaps and build unshakeable math confidence before the school year begins.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {["Live Expert Instruction", "Targeted Gap Practice", "Confidence Building", "Weekly Progress Reports"].map((feature) => (
                      <div key={feature} className="bg-white p-3 rounded-xl border border-brand-indigo/10 text-center text-sm font-semibold text-brand-charcoal flex items-center justify-center">
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" size="lg" className="w-full md:w-auto px-10">
                    Enroll {user.studentName} Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* 
        ========================================
        PROFESSIONAL PRINT UI (ONLY VISIBLE ON PDF EXPORT)
        ========================================
      */}
      <div className="hidden print:block bg-white text-black w-full h-[11in] max-h-[11in] overflow-hidden font-sans leading-normal px-8 py-10 box-border relative">
        {/* Print Header */}
        <div className="border-b-4 border-brand-indigo pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-black text-brand-indigo tracking-tight uppercase m-0 p-0">Mindverse Learning</h1>
            <h2 className="text-lg font-bold text-brand-charcoal/80 mt-1 m-0 p-0">Official Diagnostic Report</h2>
          </div>
          <div className="text-right text-xs font-medium text-gray-500 space-y-1">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Student: <span className="font-bold text-black">{user.studentName}</span></div>
            <div>Entering Grade: <span className="font-bold text-black">{user.gradeLevel}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Main Score Box */}
          <div className="bg-brand-ivory/50 border-2 border-brand-indigo p-5 rounded-xl">
            <div className="text-[10px] font-bold tracking-widest text-brand-charcoal/60 uppercase mb-2">Overall Readiness Score</div>
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-heading font-black text-brand-indigo">{results.weightedPct}%</div>
              <div className="text-sm font-bold text-brand-orange uppercase">{results.readinessLevel}</div>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
              This score emphasizes critical pre-algebra domains (Fractions, Operations, Algebraic Thinking) identifying true middle school readiness.
            </p>
          </div>

          {/* Parent Insights Box */}
          <div className="border-2 border-gray-200 p-5 rounded-xl flex flex-col justify-center">
            <div className="text-[10px] font-bold tracking-widest text-brand-charcoal/60 uppercase mb-3">Parent Survey Insights</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Learning Habits</div>
                <div className="text-base font-bold text-brand-indigo">{results.habits >= 20 ? "Strong" : results.habits >= 14 ? "Developing" : "Building"}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Confidence Profile</div>
                <div className="text-base font-bold text-brand-indigo">{results.confidence >= 20 ? "High" : results.confidence >= 14 ? "Emerging" : "Growing"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Domains */}
        <h3 className="text-sm font-heading font-bold text-brand-indigo border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">Domain Mastery Breakdown</h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Object.entries(results.domainScores || {}).map(([domain, score]: [string, any]) => {
            const pct = Math.round((score.correct / score.total) * 100) || 0;
            return (
              <div key={domain} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                <div className="text-[8px] font-bold text-gray-500 uppercase leading-tight mb-1 h-6 flex items-center">{domain}</div>
                <div className="text-lg font-heading font-bold text-black mb-1">{pct}%</div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-indigo" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[8px] text-gray-400 mt-1 font-medium">{score.correct} of {score.total} correct</div>
              </div>
            );
          })}
        </div>

        {/* Strengths and Growth */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-heading font-bold text-brand-green border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">Top Demonstrated Strengths</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-800 font-medium">
              {results.topStrengths && results.topStrengths.length > 0 ? (
                results.topStrengths.map((str: string, i: number) => <li key={i}>{str}</li>)
              ) : (
                <li className="text-gray-400 italic">Needs more data to identify concrete strengths.</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-heading font-bold text-brand-orange border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">Priority Growth Areas</h3>
            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-800 font-medium">
              {results.topGrowthAreas && results.topGrowthAreas.length > 0 ? (
                results.topGrowthAreas.map((area: string, i: number) => <li key={i}>{area}</li>)
              ) : (
                <li className="text-gray-400 italic">Great job! No major conceptual gaps identified.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-brand-indigo text-white p-5 rounded-xl absolute bottom-10 left-8 right-8">
          <h3 className="text-sm font-bold mb-1">Recommended Next Steps</h3>
          <p className="text-[10px] text-white/90 leading-relaxed m-0">
            Based on {user.studentName}'s performance in the priority growth areas, we highly recommend enrolling in the <strong>Bridge to Middle School Math Bootcamp</strong>. This tailored curriculum directly addresses foundational gaps, ensuring a smooth, confident transition into rigorous pre-algebra coursework.
          </p>
        </div>

        <div className="text-center text-[10px] text-gray-400 absolute bottom-4 left-0 right-0">
          Generated automatically by Mindverse Learning • mindverselearning.com
        </div>
      </div>
    </>
  );
}
