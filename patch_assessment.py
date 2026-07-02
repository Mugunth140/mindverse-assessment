import re

with open("src/app/assessment/page.tsx", "r") as f:
    content = f.read()

# 1. Fix getProgress
old_progress = """  const getProgress = () => {
    if (currentSection === "PARENT_RESULTS") return (PARENT_QUESTIONS.length / totalQuestions) * 100;
    
    let completed = 0;
    if (currentSection === "PARENT") completed = currentIndex;
    if (currentSection === "STUDENT") completed = PARENT_QUESTIONS.length + currentIndex;
    
    return (completed / totalQuestions) * 100;
  };"""

new_progress = """  const getProgress = () => {
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
  };"""

content = content.replace(old_progress, new_progress)

# 2. Redesign PARENT_RESULTS card and remove arrows
# Note: I'll use regex to replace the entire PARENT_RESULTS block.

pattern = r'<div className="bg-white rounded-3xl p-8 md:p-12 shadow-\[0_8px_40px_rgb\(0,0,0,0\.04\)\] border border-brand-charcoal/5 flex flex-col items-center">.*?</Button>\s*</div>\s*</div>'

new_card = """<div className="bg-white rounded-[2rem] border-[3px] border-brand-blue shadow-[8px_8px_0_0_#1a2333] p-8 md:p-12 flex flex-col items-center relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent/5 rounded-tr-full pointer-events-none" />
                
                <motion.div 
                  className={`w-20 h-20 rounded-[1.5rem] border-4 border-white shadow-lg flex items-center justify-center text-white mb-8 relative z-10 ${
                    parentResults?.zone === "Green" ? "bg-brand-green" : 
                    parentResults?.zone === "Yellow" ? "bg-brand-orange" : "bg-brand-accent"
                  }`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                
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
                  <div className="flex flex-col w-full gap-4 relative z-10">
                    <Button 
                      size="lg" 
                      variant="primary" 
                      onClick={handleNext}
                      className="w-full h-16 text-lg rounded-xl shadow-[4px_4px_0_0_#1a2333]"
                    >
                      Start Student Diagnostic
                    </Button>
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
              </div>"""

content = re.sub(pattern, new_card, content, flags=re.DOTALL)

# 3. Remove ArrowRight imports and usages
content = content.replace(', ArrowRight', '')
content = content.replace('import { ArrowRight } from "lucide-react";\n', '')
# Remove any remaining <ArrowRight ... /> tags if they exist outside the replaced block
content = re.sub(r'<ArrowRight[^>]*>', '', content)

with open("src/app/assessment/page.tsx", "w") as f:
    f.write(content)

