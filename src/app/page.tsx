"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  parentName: z.string().min(2, "Parent name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  studentName: z.string().min(2, "Student name is required"),
  gradeLevel: z.enum(["6", "7"], { message: "Please select a grade" }),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gradeLevel: "6" }
  });

  const selectedGrade = watch("gradeLevel");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    localStorage.setItem("mindverse_user", JSON.stringify(data));
    localStorage.removeItem("mindverse_assessment_progress");
    setTimeout(() => {
      router.push("/assessment");
    }, 800);
  };

  return (
    <main className="min-h-[100dvh] lg:h-screen w-full bg-brand-ivory flex flex-col lg:flex-row items-center justify-center p-4 py-10 md:p-8 lg:p-12 gap-10 lg:gap-16 relative overflow-y-auto overflow-x-hidden lg:overflow-hidden">
      
      {/* Intentional Geometric Accents with Subtle Animations */}
      <motion.div 
        className="absolute top-8 left-8 w-24 h-24 bg-brand-coral rounded-full border-[3px] border-brand-indigo hidden lg:block -z-10"
        animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-8 right-16 w-32 h-32 bg-brand-green rounded-tl-[80px] rounded-br-[80px] border-[3px] border-brand-indigo hidden lg:block -z-10"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="absolute top-1/3 right-1/2 w-12 h-12 bg-brand-orange border-[3px] border-brand-indigo hidden lg:block -z-10"
        animate={{ rotate: [12, 102, 12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-brand-lavender rounded-full border-[3px] border-brand-indigo hidden lg:block -z-10"
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Left side: Editorial Typography */}
      <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-center">
        <div className="inline-flex border-2 border-brand-indigo bg-brand-lavender text-brand-indigo px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 w-max shadow-[3px_3px_0_0_#22208C]">
          Bridge to Middle School
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-heading font-black text-brand-indigo leading-[1.05] mb-6 tracking-tight">
          Is Your Child <br />
          Ready for <br />
          <span className="relative inline-block mt-1">
            <span className="relative z-10 px-3 py-1 text-white inline-block">Pre-Algebra?</span>
            <span className="absolute inset-0 bg-brand-orange rounded-xl rotate-2 border-[3px] border-brand-indigo z-0" />
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-brand-charcoal max-w-md font-medium leading-relaxed mb-8">
          Take our 15-minute diagnostic to identify hidden foundational math gaps. Get a personalized report and an immediate action plan.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 text-brand-indigo font-bold">
          <div className="flex items-center justify-center bg-white border-2 border-brand-indigo px-4 py-2.5 rounded-xl shadow-[3px_3px_0_0_#22208C] text-sm">
            Free Diagnostic
          </div>
          <div className="flex items-center justify-center bg-white border-2 border-brand-indigo px-4 py-2.5 rounded-xl shadow-[3px_3px_0_0_#22208C] text-sm">
            Instant Email Report
          </div>
        </div>
      </div>

      {/* Right side: Tactile Form */}
      <div className="w-full lg:w-[440px] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="bg-white rounded-[2rem] border-[3px] border-brand-indigo shadow-[8px_8px_0_0_#22208C] p-6 md:p-8 relative"
        >
          {/* Decorative clip */}
          <motion.div 
            className="absolute -top-5 -right-5 w-10 h-10 bg-brand-lavender border-[3px] border-brand-indigo rounded-full shadow-[3px_3px_0_0_#22208C] hidden md:block"
            animate={{ rotate: [0, 15, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <div className="mb-6">
            <h2 className="text-2xl font-heading font-black text-brand-indigo mb-1">Get Started</h2>
            <p className="text-sm text-brand-charcoal/70 font-medium">Enter your details to begin.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Input 
                placeholder="Parent's Name" 
                className="h-12 border border-brand-indigo/20 bg-brand-ivory/50 font-medium text-base placeholder:text-brand-charcoal/40"
                {...register("parentName")}
                error={!!errors.parentName}
              />
              {errors.parentName && <p className="text-red-500 text-xs font-bold ml-1">{errors.parentName.message}</p>}
            </div>
            
            <div className="space-y-1">
              <Input 
                type="email"
                placeholder="Parent's Email" 
                className="h-12 border border-brand-indigo/20 bg-brand-ivory/50 font-medium text-base placeholder:text-brand-charcoal/40"
                {...register("email")}
                error={!!errors.email}
              />
              {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Input 
                type="tel"
                placeholder="Phone Number" 
                className="h-12 border border-brand-indigo/20 bg-brand-ivory/50 font-medium text-base placeholder:text-brand-charcoal/40"
                {...register("phone")}
                error={!!errors.phone}
              />
              {errors.phone && <p className="text-red-500 text-xs font-bold ml-1">{errors.phone.message}</p>}
            </div>

            <div className="pt-1 pb-1 flex items-center gap-3">
              <div className="h-[2px] w-full bg-brand-indigo/5 rounded-full" />
              <span className="text-brand-indigo/40 font-black text-[10px] uppercase tracking-widest">Student</span>
              <div className="h-[2px] w-full bg-brand-indigo/5 rounded-full" />
            </div>

            <div className="space-y-1">
              <Input 
                placeholder="Student's Name" 
                className="h-12 border border-brand-indigo/20 bg-brand-ivory/50 font-medium text-base placeholder:text-brand-charcoal/40"
                {...register("studentName")}
                error={!!errors.studentName}
              />
              {errors.studentName && <p className="text-red-500 text-xs font-bold ml-1">{errors.studentName.message}</p>}
            </div>

            {/* Segmented Control for Grade Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-indigo ml-1 uppercase tracking-wider">Entering Grade Level</label>
              <div className="flex bg-brand-ivory/50 border-2 border-brand-indigo/20 rounded-xl p-1 gap-1">
                {["6", "7"].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setValue("gradeLevel", grade as "6"|"7")}
                    className={`flex-1 py-2 text-sm rounded-lg font-heading font-black transition-all ${
                      selectedGrade === grade 
                        ? "bg-brand-indigo text-white shadow-md" 
                        : "bg-transparent text-brand-indigo/50 hover:bg-brand-indigo/10 hover:text-brand-indigo"
                    }`}
                  >
                    Grade {grade}
                  </button>
                ))}
              </div>
              {errors.gradeLevel && <p className="text-red-500 text-xs font-bold ml-1">{errors.gradeLevel.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2 h-14 text-lg rounded-xl shadow-[0_4px_0_0_rgba(34,32,140,0.2)]" 
              variant="secondary"
              isLoading={isSubmitting}
            >
              Start Assessment
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
