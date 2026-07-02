import re

with open("src/app/assessment/page.tsx", "r") as f:
    content = f.read()

old_card = """              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-brand-charcoal/5 flex flex-col items-center">
                <div 
                  className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6"
                >
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-charcoal mb-3 tracking-tight">
                  Thank You!
                </h2>
                
                <p className="text-base text-brand-charcoal/60 mb-8 leading-relaxed">
                  The parent portion is complete. Please hand the device over to <span className="font-bold text-brand-blue">{userData.studentName}</span> for the math diagnostic.
                </p>
                
                <Button 
                  size="lg" 
                  variant="primary" 
                  onClick={handleNext}
                  className="w-full h-14 text-base rounded-xl shadow-md shadow-brand-blue/10 group flex items-center justify-center gap-2"
                >
                  I am {userData.studentName}, let's go!
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>"""

new_card = """              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-brand-charcoal/5 flex flex-col items-center">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 ${
                    parentResults?.zone === "Green" ? "bg-brand-green" : 
                    parentResults?.zone === "Yellow" ? "bg-brand-orange" : "bg-brand-accent"
                  }`}
                >
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <h2 className="text-xl md:text-2xl font-heading font-bold text-brand-charcoal mb-4 tracking-tight">
                  {parentResults?.headline}
                </h2>
                
                <p className="text-sm md:text-base text-brand-charcoal/60 mb-8 leading-relaxed">
                  {parentResults?.body}
                </p>
                
                {linkSent ? (
                  <div className="w-full bg-brand-green/10 text-brand-green border border-brand-green/20 p-4 rounded-xl font-medium text-sm mb-4">
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
                      onClick={() => setLinkSent(true)}
                      className="w-full h-14 text-sm rounded-xl text-brand-charcoal"
                    >
                      Send me the link for the test
                    </Button>
                  </div>
                )}
              </div>"""

content = content.replace(old_card, new_card)

with open("src/app/assessment/page.tsx", "w") as f:
    f.write(content)
