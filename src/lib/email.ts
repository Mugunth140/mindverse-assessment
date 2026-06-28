import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function sendReportEmail(user: any, reportData: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY is missing. Skipping email send. Here is what would be sent:");
    console.log(`To: ${user.email} | Subject: Mindverse Diagnostic Report for ${user.studentName}`);
    return { success: false, message: 'API key missing' };
  }

  const htmlContent = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #2F2F2F;">
      <h1 style="color: #22208C;">Mindverse Learning</h1>
      <h2>Diagnostic Report for ${user.studentName}</h2>
      
      <div style="background-color: #FAF8F4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #22208C;">Overall Diagnostic Score: <span style="font-size: 24px;">${reportData.weightedPct}%</span></h3>
        <p><strong>Readiness Level:</strong> <span style="color: #C96A28;">${reportData.readinessLevel}</span></p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #7FAE6D;">Top Strengths</h3>
        <ul>
          ${reportData.topStrengths.length > 0 
            ? reportData.topStrengths.map((str: string) => `<li>${str}</li>`).join('')
            : '<li>Needs more data to identify concrete strengths.</li>'}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #C96A28;">Priority Growth Areas</h3>
        <ul>
          ${reportData.topGrowthAreas.length > 0 
            ? reportData.topGrowthAreas.map((str: string) => `<li>${str}</li>`).join('')
            : '<li>Great job! No major conceptual gaps identified.</li>'}
        </ul>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      
      <p style="font-size: 14px; color: #666;">
        Thank you for completing the Mindverse Middle School Math Readiness Diagnostic! 
        Log back into your account to unlock deep insights and personalized action plans.
      </p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Mindverse Learning <onboarding@resend.dev>', // Using Resend's testing domain so it works without verification
      to: [user.email],
      subject: `Mindverse Math Diagnostic Report: ${user.studentName}`,
      html: htmlContent,
    });

    if (data.error) {
      console.error("Resend API Error details:", data.error);
      if (data.error.name === 'validation_error' && data.error.message.includes('verified')) {
        console.warn("⚠️ RESEND FREE TIER RULE: You are using onboarding@resend.dev. You can ONLY send emails TO the exact email address you used to sign up for Resend. Please use your own email in the Parent form!");
      }
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to execute Resend email send:", error);
    return { success: false, error };
  }
}
