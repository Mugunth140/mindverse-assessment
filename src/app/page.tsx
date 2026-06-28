"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const schema = z.object({
  parentName: z.string().min(2, "Parent name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  studentName: z.string().min(2, "Student name is required"),
  gradeLevel: z.enum(["5", "6", "7"], { message: "Please select a grade" }),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gradeLevel: "5" }
  });

  const selectedGrade = watch("gradeLevel");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // In a real app, save to Supabase here.
    // For now, save to localStorage to persist across routes
    localStorage.setItem("mindverse_user", JSON.stringify(data));
    localStorage.removeItem("mindverse_assessment_progress"); // Reset previous progress
    
    // Slight delay for UX
    setTimeout(() => {
      router.push("/assessment");
    }, 800);
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Left side: Hero/Brand */}
      <div className="w-full md:w-1/2 bg-brand-indigo text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-72 h-72 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-block bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-brand-lavender mb-6">
            BRIDGE TO MIDDLE SCHOOL MATH
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight mb-4">
            Is Your Child Ready <br/>
            <span className="text-brand-orange">for Pre-Algebra?</span>
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-md leading-relaxed mb-8">
            Take our 15-minute diagnostic to identify hidden foundational math gaps. Get a personalized report and immediate action plan to build unshakeable confidence.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" /> Free Diagnostic
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" /> Instant Report via Email
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Form */}
      <div className="w-full md:w-1/2 bg-brand-ivory p-6 md:p-8 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl shadow-brand-indigo/5 bg-white overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-brand-orange to-brand-coral w-full" />
            <CardHeader className="pt-6 pb-2">
              <CardTitle className="text-2xl text-brand-indigo mb-1">Get Started</CardTitle>
              <CardDescription className="text-sm">
                Enter your details to begin the assessment for your child.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Input 
                    placeholder="Parent's Name" 
                    className="h-12"
                    {...register("parentName")}
                    error={!!errors.parentName}
                  />
                  {errors.parentName && <p className="text-red-500 text-xs ml-2">{errors.parentName.message}</p>}
                </div>
                
                <div className="space-y-1">
                  <Input 
                    type="email"
                    placeholder="Parent's Email" 
                    className="h-12"
                    {...register("email")}
                    error={!!errors.email}
                  />
                  {errors.email && <p className="text-red-500 text-xs ml-2">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <Input 
                    type="tel"
                    placeholder="Phone Number" 
                    className="h-12"
                    {...register("phone")}
                    error={!!errors.phone}
                  />
                  {errors.phone && <p className="text-red-500 text-xs ml-2">{errors.phone.message}</p>}
                </div>

                <div className="pt-2 pb-1">
                  <div className="h-px w-full bg-brand-charcoal/10" />
                </div>

                <div className="space-y-1">
                  <Input 
                    placeholder="Student's Name" 
                    className="h-12"
                    {...register("studentName")}
                    error={!!errors.studentName}
                  />
                  {errors.studentName && <p className="text-red-500 text-xs ml-2">{errors.studentName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-charcoal ml-2">Entering Grade Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["5", "6", "7"].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setValue("gradeLevel", grade as "5"|"6"|"7")}
                        className={`py-2 text-sm rounded-xl border-2 font-heading font-semibold transition-all ${
                          selectedGrade === grade 
                            ? "border-brand-indigo bg-brand-indigo/5 text-brand-indigo" 
                            : "border-brand-charcoal/10 text-brand-charcoal/60 hover:border-brand-indigo/30"
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                  {errors.gradeLevel && <p className="text-red-500 text-xs ml-2">{errors.gradeLevel.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-2" 
                  size="md"
                  isLoading={isSubmitting}
                >
                  Start Assessment
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
