"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, ArrowRight } from "lucide-react";
import { PARENT_QUESTIONS } from "@/data/parent_questions";
import { STUDENT_QUESTIONS } from "@/data/student_questions";

type Section = "PARENT" | "TRANSITION" | "STUDENT";

export default function AssessmentPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const [currentSection, setCurrentSection] = useState<Section>("PARENT");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load state on mount
  useEffect(() => {
    const user = localStorage.getItem("mindverse_user");
    if (!user) {
      router.push("/");
      return;
    }
    setUserData(JSON.parse(user));
    
    const savedProgress = localStorage.getItem("mindverse_assessment_progress");
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setCurrentSection(parsed.currentSection);
      setCurrentIndex(parsed.currentIndex);
      setResponses(parsed.responses);
    }
    
    setIsLoaded(true);
  }, [router]);

  // Autosave
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mindverse_assessment_progress", JSON.stringify({
        currentSection,
        currentIndex,
        responses
      }));
    }
  }, [currentSection, currentIndex, responses, isLoaded]);

  if (!isLoaded || !userData) return null;

  const totalQuestions = PARENT_QUESTIONS.length + STUDENT_QUESTIONS.length;

  const getProgress = () => {
    if (currentSection === "TRANSITION") return (PARENT_QUESTIONS.length / totalQuestions) * 100;
    
    let completed = 0;
    if (currentSection === "PARENT") completed = currentIndex;
    if (currentSection === "STUDENT") completed = PARENT_QUESTIONS.length + currentIndex;
    
    return (completed / totalQuestions) * 100;
  };

  const handleAnswer = (answer: string | number) => {
    const qId = currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex].id : STUDENT_QUESTIONS[currentIndex].id;
    setResponses(prev => ({ ...prev, [qId]: answer }));
  };

  const handleNext = async () => {
    if (currentSection === "PARENT") {
      if (currentIndex < PARENT_QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentSection("TRANSITION");
      }
    } else if (currentSection === "TRANSITION") {
      setCurrentSection("STUDENT");
      setCurrentIndex(0);
    } else if (currentSection === "STUDENT") {
      if (currentIndex < STUDENT_QUESTIONS.length - 1) {
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
        setCurrentSection("TRANSITION");
      }
    } else if (currentSection === "TRANSITION") {
      setCurrentSection("PARENT");
      setCurrentIndex(PARENT_QUESTIONS.length - 1);
    } else if (currentSection === "PARENT") {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
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
          responses
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

  const currentQId = currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex]?.id : STUDENT_QUESTIONS[currentIndex]?.id;
  const currentAnswer = responses[currentQId] ?? null;

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col relative pb-32">
      {/* Header & Progress */}
      <header className="bg-white px-6 py-4 shadow-sm border-b border-brand-charcoal/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
          <div className="font-heading font-bold text-brand-indigo text-lg">
            Mindverse
          </div>
          <div className="text-sm font-medium text-brand-charcoal/60">
            {currentSection === "PARENT" ? "Parent Questionnaire" : 
             currentSection === "STUDENT" ? "Student Diagnostic" : 
             "Transition"}
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <ProgressBar progress={getProgress()} />
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 md:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentSection === "TRANSITION" ? (
            <motion.div
              key="transition"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-center w-full max-w-md mx-auto mt-4"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-brand-charcoal/5 flex flex-col items-center">
                <motion.div 
                  className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-charcoal mb-3 tracking-tight">
                  Thank You!
                </h2>
                
                <p className="text-base text-brand-charcoal/60 mb-8 leading-relaxed">
                  The parent portion is complete. Please hand the device over to <span className="font-bold text-brand-indigo">{userData.studentName}</span> for the math diagnostic.
                </p>
                
                <Button 
                  size="lg" 
                  variant="primary" 
                  onClick={handleNext}
                  className="w-full h-14 text-base rounded-xl shadow-md shadow-brand-indigo/10 group flex items-center justify-center gap-2"
                >
                  I am {userData.studentName}, let's go!
                </Button>
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
              <Card className="border-none shadow-lg shadow-brand-indigo/5">
                <CardContent className="p-6 md:p-8">
                  <div className="text-xs font-bold tracking-widest text-brand-charcoal/40 uppercase mb-3">
                    {currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex].section : STUDENT_QUESTIONS[currentIndex].domain}
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-brand-charcoal mb-6 leading-relaxed">
                    {currentSection === "PARENT" ? PARENT_QUESTIONS[currentIndex].text : STUDENT_QUESTIONS[currentIndex].q}
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
                                  ? "bg-brand-indigo text-white shadow-[0_4px_0_0_#1a196e] translate-y-[-2px]" 
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
                      {STUDENT_QUESTIONS[currentIndex].choices.map((opt, idx) => {
                        const isSelected = currentAnswer === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full flex items-center p-3 md:p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected 
                              ? "border-brand-indigo bg-brand-indigo/5 shadow-[0_2px_0_0_#22208C]" 
                              : "border-brand-charcoal/10 hover:border-brand-indigo/30 hover:bg-brand-indigo/5"
                            }`}
                          >
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-3 transition-colors ${
                              isSelected ? "bg-brand-indigo text-white" : "bg-brand-charcoal/10 text-brand-charcoal"
                            }`}>
                              {["A", "B", "C", "D"][idx]}
                            </div>
                            <span className={`text-base font-medium ${isSelected ? "text-brand-indigo" : "text-brand-charcoal/80"}`}>
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
      {currentSection !== "TRANSITION" && (
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
              {currentSection === "STUDENT" && currentIndex === STUDENT_QUESTIONS.length - 1 ? "Submit Assessment" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
