import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
  try {
    const { user } = await request.json();
    
    // Encode user data in the URL so they can resume on a different device without losing context
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/assessment?resumeData=${encodedUser}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #2F2F2F;">
        <h1 style="color: #2B3A55;">Mindverse Learning</h1>
        <h2>Math Diagnostic Link for ${user.studentName}</h2>
        <p>You requested a link so ${user.studentName} can complete the math diagnostic on another device.</p>
        <p>Click the button below to jump straight into the student assessment (the parent portion is already complete!).</p>
        <br/>
        <a href="${magicLink}" style="display: inline-block; background-color: #2B3A55; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          Start Student Diagnostic
        </a>
        <br/><br/>
        <p style="font-size: 12px; color: #666;">Or copy and paste this link: ${magicLink}</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
      const data = await resend.emails.send({
        from: 'Mindverse Learning <onboarding@resend.dev>',
        to: [user.email],
        subject: `Mindverse Math Diagnostic Link for ${user.studentName}`,
        html: htmlContent,
      });
      
      if (data.error) {
        console.error("Resend API Error details:", data.error);
        if (data.error.name === 'validation_error' && data.error.message.includes('verified')) {
          console.warn("⚠️ RESEND FREE TIER RULE: You are using onboarding@resend.dev. You can ONLY send emails TO the exact email address you used to sign up for Resend. Please use your own email in the Parent form!");
        }
        return NextResponse.json({ success: false, error: data.error }, { status: 400 });
      }
    } else {
      console.warn("⚠️ No RESEND_API_KEY found. Email not sent. Here is the magic link:");
      console.log(magicLink);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send link:", error);
    return NextResponse.json({ success: false, error: "Failed to send link" }, { status: 500 });
  }
}
