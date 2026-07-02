"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";
import { PARENT_QUESTIONS } from "@/data/parent_questions";
import questionBank from "@/data/question_bank.json";

type Section = "PARENT" | "PARENT_RESULTS" | "STUDENT";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const [currentSection, setCurrentSection] = useState<Section>("PARENT");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  
  const [studentQuestions, setStudentQuestions] = useState<any[]>([]);

  useEffect(() => {
    let user = null;
    let resumeMode = false;

    const urlParams = new URLSearchParams(window.location.search);
    const resumeData = urlParams.get('resumeData');
    
    if (resumeData) {
      try {
        user = JSON.parse(decodeURIComponent(resumeData));
        localStorage.setItem("mindverse_user", JSON.stringify(user));
        resumeMode = true;
      } catch (e) {
        console.error("Failed to parse resume data");
      }
    } else {
      const userStr = localStorage.getItem("mindverse_user");
      if (userStr) user = JSON.parse(userStr);
    }

    if (!user) {
      router.push("/");
      return;
    }
    
    setUserData(user);
    
    const gradeKey = `grade${user.gradeLevel}` as keyof typeof questionBank;
    let questionsRaw = (questionBank as any)[gradeKey] || [];
    
    let shuffled = shuffleArray(questionsRaw).map((q: any) => {
      const choicesWithOriginalIndex = q.choices.map((c: string, i: number) => ({ text: c, isCorrect: i === q.ans }));
      const shuffledChoices = shuffleArray<{text: string, isCorrect: boolean}>(choicesWithOriginalIndex);
      const newAnsIndex = shuffledChoices.findIndex(c => c.isCorrect);
      return {
        ...q,
        choices: shuffledChoices.map((c: {text: string}) => c.text),
        ans: newAnsIndex
      };
    });
    
    setStudentQuestions(shuffled);

    const savedProgress = localStorage.getItem("mindverse_assessment_progress");
    if (savedProgress && !resumeMode) {
      const parsed = JSON.parse(savedProgress);
      setCurrentSection(parsed.currentSection);
      setCurrentIndex(parsed.currentIndex);
      setResponses(parsed.responses);
      if (parsed.shuffledQuestions) setStudentQuestions(parsed.shuffledQuestions);
    } else if (resumeMode) {
      setCurrentSection("STUDENT");
      setCurrentIndex(0);
    }
    
    setIsLoaded(true);
  }, [router]);

  useEffect(() => {
    if (isLoaded && studentQuestions.length > 0) {
      localStorage.setItem("mindverse_assessment_progress", JSON.stringify({
        currentSection,
        currentIndex,
        responses,
        shuffledQuestions: studentQuestions
      }));
    }
  }, [currentSection, currentIndex, responses, isLoaded, studentQuestions]);

  if (!isLoaded || !userData || studentQuestions.length === 0) return null;

  const getProgress = () => {
    if (currentSection === "PARENT") {
      return (currentIndex / PARENT_QUESTIONS.length) * 100;
    }
    if (currentSection === "PARENT_RESULTS") {
      return 100;
    }
    if (currentSection === "STUDENT") {
      return (currentIndex / studentQuestions.length) * 100;
    }
    return 0;
  };

  const handleAnswer = (answer: string | number) => {
    const qId = currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex].id : studentQuestions[currentIndex].id;
    setResponses(prev => ({ ...prev, [qId]: answer }));
  };

  const handleNext = async () => {
    if (currentSection === "PARENT") {
      if (currentIndex < PARENT_QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentSection("PARENT_RESULTS");
      }
    } else if (currentSection === "PARENT_RESULTS") {
      setCurrentSection("STUDENT");
      setCurrentIndex(0);
    } else if (currentSection === "STUDENT") {
      if (currentIndex < studentQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        await submitAssessment();
      }
    }
  };

  const handleBack = () => {
    if (currentSection === "STUDENT") {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else {
        setCurrentSection("PARENT_RESULTS");
      }
    } else if (currentSection === "PARENT_RESULTS") {
      setCurrentSection("PARENT");
      setCurrentIndex(PARENT_QUESTIONS.length - 1);
    } else if (currentSection === "PARENT") {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleSendLink = async () => {
    setIsSendingLink(true);
    try {
      const res = await fetch('/api/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userData })
      });
      if (res.ok) {
        setLinkSent(true);
      } else {
        alert("Failed to send link. Please check your email configuration.");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending link.");
    } finally {
      setIsSendingLink(false);
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userData,
          responses,
          shuffledQuestions: studentQuestions
        })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("mindverse_results", JSON.stringify(data.data));
        router.push("/results");
      } else {
        alert("Something went wrong saving your results.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const currentQId = currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex]?.id : studentQuestions[currentIndex]?.id;
  const currentAnswer = responses[currentQId] ?? null;

  const getParentResults = () => {
    let rawSum = 0;
    for (let i = 1; i <= 6; i++) rawSum += (Number(responses[`P${i}`]) || 0);
    const q7 = Number(responses["P7"]) || 0;
    const total = rawSum + (6 - q7);

    const CUTOFF_GREEN = 28;
    const CUTOFF_YELLOW = 17;

    if (total >= CUTOFF_GREEN) {
      return {
        zone: "Green",
        headline: "Your child shows strong math fundamentals.",
        body: "Based on your responses, your child is building solid habits in math. A quick Student Assessment will confirm their strengths and show where to build even further."
      };
    } else if (total >= CUTOFF_YELLOW) {
      return {
        zone: "Yellow",
        headline: "A few patterns stood out in your responses.",
        body: "Your answers point to some areas worth a closer look. A quick Student Assessment will show exactly where your child stands and what to focus on next."
      };
    } else {
      return {
        zone: "Red",
        headline: "There are clear opportunities to strengthen your child's math foundation.",
        body: "Your responses suggest a few key areas where your child could use extra support. A quick Student Assessment will pinpoint exactly what's needed to help them catch up with confidence."
      };
    }
  };

  const parentResults = currentSection === "PARENT_RESULTS" ? getParentResults() : null;

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col relative pb-32">
      {/* Header & Progress */}
      <header className="bg-white px-6 py-4 shadow-sm border-b border-brand-charcoal/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
          <div className="font-heading font-bold text-brand-blue text-lg">
            Mindverse
          </div>
          <div className="text-sm font-medium text-brand-charcoal/60">
            {currentSection === "PARENT" ? "Parent Questionnaire" : 
             currentSection === "STUDENT" ? "Student Diagnostic" : 
             "Parent Insights"}
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <ProgressBar progress={getProgress()} />
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 md:p-8 flex flex-col justify-start sm:justify-center">
        <AnimatePresence mode="wait">
          {currentSection === "PARENT_RESULTS" ? (
            <motion.div
              key="parent_results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-center w-full max-w-md mx-auto mt-4"
            >
              <div className="bg-white rounded-[2rem] border-[3px] border-brand-blue shadow-[8px_8px_0_0_#1a2333] p-8 md:p-12 flex flex-col items-center relative">
                <h2 className="text-2xl md:text-3xl font-heading font-black text-brand-blue mb-4 tracking-tight text-center relative z-10 leading-snug">
                  {parentResults?.headline}
                </h2>
                
                <p className="text-base text-brand-charcoal/70 mb-10 leading-relaxed text-center max-w-sm relative z-10 font-medium">
                  {parentResults?.body}
                </p>
                
                {linkSent ? (
                  <div className="w-full bg-brand-green/10 text-brand-green border-2 border-brand-green p-4 rounded-xl font-bold text-center relative z-10 shadow-[4px_4px_0_0_#7FAE6D]">
                    Link sent to {userData?.email}!
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-4 relative z-10 mt-2">
                    <div className="flex flex-col gap-2 w-full">
                      <span className="text-[10px] font-black text-brand-charcoal/40 uppercase tracking-widest text-center">It's free, start now</span>
                      <Button 
                        size="lg" 
                        variant="primary" 
                        onClick={handleNext}
                        className="w-full h-16 text-lg rounded-xl shadow-[4px_4px_0_0_#1a2333]"
                      >
                        Start Student Diagnostic
                      </Button>
                    </div>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={handleSendLink}
                      isLoading={isSendingLink}
                      className="w-full h-16 text-base rounded-xl font-bold text-brand-blue border-2 border-brand-blue/20 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                    >
                      Send test link to email
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentQId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card className="border-none shadow-lg shadow-brand-blue/5">
                <CardContent className="p-6 md:p-8">
                  <div className="text-xs font-bold tracking-widest text-brand-charcoal/40 uppercase mb-3">
                    {currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex].section : studentQuestions[currentIndex].domain}
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-brand-charcoal mb-6 leading-relaxed">
                    {currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex].text : studentQuestions[currentIndex].q}
                  </h2>

                  {currentSection === "PARENT" ? (
                    <div className="space-y-4">
                      <p className="text-center text-xs font-medium text-brand-charcoal/60 mb-2">
                        Rate from 1 (Strongly Disagree) to 5 (Strongly Agree)
                      </p>
                      <div className="flex justify-between items-center gap-2 max-w-md mx-auto">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const isSelected = currentAnswer === rating;
                          return (
                            <button
                              key={rating}
                              onClick={() => handleAnswer(rating)}
                              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center font-heading font-bold text-lg transition-all ${
                                isSelected 
                                  ? "bg-brand-blue text-white shadow-[0_4px_0_0_#1a2333] translate-y-[-2px]" 
                                  : "bg-brand-charcoal/5 text-brand-charcoal/70 hover:bg-brand-charcoal/10"
                              }`}
                            >
                              {rating}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] font-semibold text-brand-charcoal/40 max-w-md mx-auto px-2">
                        <span>Disagree</span>
                        <span>Agree</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {studentQuestions[currentIndex].choices.map((opt: string, idx: number) => {
                        const isSelected = currentAnswer === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full flex items-center p-3 md:p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected 
                              ? "border-brand-blue bg-brand-blue/5 shadow-[0_2px_0_0_#1a2333]" 
                              : "border-brand-charcoal/10 hover:border-brand-blue/30 hover:bg-brand-blue/5"
                            }`}
                          >
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-3 transition-colors ${
                              isSelected ? "bg-brand-blue text-white" : "bg-brand-charcoal/10 text-brand-charcoal"
                            }`}>
                              {["A", "B", "C", "D"][idx]}
                            </div>
                            <span className={`text-base font-medium ${isSelected ? "text-brand-blue" : "text-brand-charcoal/80"}`}>
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Footer Navigation */}
      {currentSection !== "PARENT_RESULTS" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-brand-ivory border-t border-brand-charcoal/10 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={currentSection === "PARENT" && currentIndex === 0}
            >
              Back
            </Button>
            <Button 
              size="md" 
              onClick={handleNext}
              disabled={currentAnswer === null || isSubmitting}
              isLoading={isSubmitting}
              className="px-8"
            >
              {currentSection === "STUDENT" && currentIndex === studentQuestions.length - 1 ? "Submit Assessment" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
