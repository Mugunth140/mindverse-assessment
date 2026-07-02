import re

with open("src/app/assessment/page.tsx", "r") as f:
    content = f.read()

pattern = r'<div className="bg-white rounded-\[2rem\] border-\[3px\] border-brand-blue shadow-\[8px_8px_0_0_#1a2333\] p-8 md:p-12 flex flex-col items-center relative overflow-hidden">.*?</div>\s*\)\}\s*</div>'

new_card = """<div className="bg-white rounded-[2rem] border-[3px] border-brand-blue shadow-[8px_8px_0_0_#1a2333] p-8 md:p-12 flex flex-col items-center relative">
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
              </div>"""

content = re.sub(pattern, new_card, content, flags=re.DOTALL)

with open("src/app/assessment/page.tsx", "w") as f:
    f.write(content)
