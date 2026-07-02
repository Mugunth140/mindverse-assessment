import re

with open("src/app/assessment/page.tsx", "r") as f:
    content = f.read()

# Make sure the section name is right
content = content.replace('{currentSection === "TRANSITION" ? (', '{currentSection === "PARENT_RESULTS" ? (')

# Find the block from <div className="bg-white rounded-3xl to </div>\n            </motion.div>
pattern = r'<div className="bg-white rounded-3xl p-8 md:p-12 shadow-\[0_8px_40px_rgb\(0,0,0,0\.04\)\] border border-brand-charcoal/5 flex flex-col items-center">.*?</Button>\s*</div>'

new_block = """<div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-brand-charcoal/5 flex flex-col items-center">
                <motion.div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 ${
                    parentResults?.zone === "Green" ? "bg-brand-green" : 
                    parentResults?.zone === "Yellow" ? "bg-brand-orange" : "bg-brand-accent"
                  }`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                
                <h2 className="text-xl md:text-2xl font-heading font-bold text-brand-charcoal mb-4 tracking-tight text-center">
                  {parentResults?.headline}
                </h2>
                
                <p className="text-sm md:text-base text-brand-charcoal/60 mb-8 leading-relaxed text-center">
                  {parentResults?.body}
                </p>
                
                {linkSent ? (
                  <div className="w-full bg-brand-green/10 text-brand-green border border-brand-green/20 p-4 rounded-xl font-medium text-sm mb-4 text-center">
                    Link successfully sent to {userData?.email}! You can close this page.
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-3">
                    <Button 
                      size="lg" 
                      variant="primary" 
                      onClick={handleNext}
                      className="w-full h-14 text-sm md:text-base rounded-xl shadow-md shadow-brand-blue/10 group flex items-center justify-center gap-2"
                    >
                      Start Free Math Readiness Assessment
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={handleSendLink}
                      isLoading={isSendingLink}
                      className="w-full h-14 text-sm rounded-xl text-brand-charcoal hover:bg-brand-charcoal/5"
                    >
                      Send me the link for the test
                    </Button>
                  </div>
                )}
              </div>"""

content = re.sub(pattern, new_block, content, flags=re.DOTALL)

with open("src/app/assessment/page.tsx", "w") as f:
    f.write(content)
