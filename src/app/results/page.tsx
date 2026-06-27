"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
    <div className="min-h-screen bg-brand-ivory pb-20 print:bg-white print:pb-0">
      {/* Header */}
      <header className="bg-brand-indigo text-white py-12 px-6 shadow-md relative overflow-hidden print:bg-brand-indigo print:text-black">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl print:hidden" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 print:text-black">
              Diagnostic Report
            </h1>
            <p className="text-lg text-white/80 max-w-xl print:text-black/80">
              Here is the personalized mathematics profile for <span className="font-semibold text-brand-orange">{user.studentName}</span> (Entering Grade {user.gradeLevel}).
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="mt-6 md:mt-0 print:hidden shadow-lg shadow-black/10"
            onClick={() => window.print()}
          >
            Download Report (PDF)
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-[-40px] relative z-20 print:mt-6">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          
          {/* Top Level Summary */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-xl shadow-brand-indigo/5 border-none print:shadow-none print:border print:border-gray-200">
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
                  This score is weighted to emphasize critical pre-algebra domains such as Fractions, Operations, and Variables.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl shadow-brand-indigo/5 border-none bg-gradient-to-br from-brand-charcoal to-brand-charcoal/90 text-white print:bg-white print:text-black print:border print:border-gray-200">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="text-sm font-bold tracking-widest text-white/50 print:text-black/50 uppercase mb-4">Parent Insights</div>
                
                <div className="w-full bg-white/10 print:bg-black/5 rounded-xl p-4 mb-3">
                  <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Learning Habits</div>
                  <div className="text-xl font-heading font-bold">
                    {results.habits >= 20 ? "Strong" : results.habits >= 14 ? "Developing" : "Building"}
                  </div>
                </div>

                <div className="w-full bg-white/10 print:bg-black/5 rounded-xl p-4">
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
            <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Domain Mastery Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.domainScores).map(([domain, score]: [string, any]) => {
                    const pct = Math.round((score.correct / score.total) * 100);
                    return (
                      <div key={domain} className="bg-brand-charcoal/5 p-4 rounded-xl border border-brand-charcoal/5">
                        <div className="text-xs font-bold text-brand-charcoal/50 uppercase mb-1">{domain}</div>
                        <div className="text-2xl font-heading font-bold text-brand-charcoal mb-2">{pct}%</div>
                        <div className="h-2 w-full bg-brand-charcoal/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${pct >= 80 ? 'bg-brand-green' : pct >= 50 ? 'bg-brand-orange' : 'bg-brand-coral'}`} 
                            style={{ width: `${pct}%` }} 
                          />
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
            <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center">
                    <span className="text-brand-green text-xl font-bold">↑</span>
                  </div>
                  <CardTitle className="text-xl">Top Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {results.topStrengths && results.topStrengths.length > 0 ? (
                  <ul className="space-y-3">
                    {results.topStrengths.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 bg-brand-green/5 p-3 rounded-xl border border-brand-green/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 flex-shrink-0" />
                        <span className="font-medium text-brand-charcoal/90">{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-brand-charcoal/60 italic">Needs more data to identify concrete strengths.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
                    <span className="text-brand-orange text-xl font-bold">↓</span>
                  </div>
                  <CardTitle className="text-xl">Priority Growth Areas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {results.topGrowthAreas && results.topGrowthAreas.length > 0 ? (
                  <ul className="space-y-3">
                    {results.topGrowthAreas.map((area: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 bg-brand-orange/5 p-3 rounded-xl border border-brand-orange/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
                        <span className="font-medium text-brand-charcoal/90">{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-brand-charcoal/60 italic">Great job! No major conceptual gaps identified.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Upsell Placeholder */}
          <motion.div variants={itemVariants} className="print:hidden">
            <Card className="border-2 border-brand-indigo bg-brand-indigo/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <CardHeader>
                <div className="inline-block bg-brand-indigo text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 w-max">
                  Premium Report
                </div>
                <CardTitle className="text-2xl text-brand-indigo">Unlock Deep Insights</CardTitle>
                <CardDescription className="text-base text-brand-charcoal/80 max-w-2xl">
                  Get a comprehensive analysis of {user.studentName}'s mathematical thinking, including the Future Algebra Risk index, Confidence vs Competence mapping, and a Personalized Action Plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {["Future Algebra Risk", "Confidence vs Competence", "Personalized Action Plan", "Recommended Modules"].map((feature) => (
                    <div key={feature} className="bg-white p-3 rounded-xl border border-brand-indigo/10 text-center text-sm font-semibold text-brand-charcoal">
                      {feature}
                    </div>
                  ))}
                </div>
                <Button variant="primary" size="lg">Unlock Premium for $19</Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
