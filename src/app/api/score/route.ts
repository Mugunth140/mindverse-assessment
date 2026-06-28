import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { STUDENT_QUESTIONS } from '@/data/student_questions';
import { sendReportEmail } from '@/lib/email';

const DOMAIN_QS = {
  "Number Sense": ["S1","S2","S3"],
  "Operations": ["S4","S5","S6"],
  "Fractions": ["S7","S8","S9","S10","S11"],
  "Decimals": ["S12","S13","S14"],
  "Percentages": ["S15","S16"],
  "Ratios": ["S17","S18"],
  "Patterns": ["S19","S20","S21"],
  "Variables": ["S22","S23","S24"],
  "Reasoning": ["S25","S26"],
  "Problem Solving": ["S27","S28"],
  "Mental Math": ["S29","S30"],
};

const LEVEL_LABELS = ["", "Foundation to Strengthen", "Developing", "Approaching Readiness", "Ready", "Highly Ready"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, responses } = body;

    const domainScores: Record<string, { correct: number, total: number }> = {};
    for (const [domain, qIds] of Object.entries(DOMAIN_QS)) {
      let correct = 0;
      for (const id of qIds) {
        const q = STUDENT_QUESTIONS.find(x => x.id === id);
        if (q && responses[id] === q.ans) correct++;
      }
      domainScores[domain] = { correct, total: qIds.length };
    }

    const totalCorrect = Object.values(domainScores).reduce((s, d) => s + d.correct, 0);
    const pct = Math.round((totalCorrect / 30) * 100);

    // Weighted score — critical domains get 1.5x
    const critical = ["Fractions","Operations","Variables"];
    const high = ["Number Sense","Ratios","Patterns","Problem Solving"];
    let weightedSum = 0; let weightedMax = 0;
    
    for (const [domain, score] of Object.entries(domainScores)) {
      const w = critical.includes(domain) ? 1.5 : high.includes(domain) ? 1.2 : 1.0;
      weightedSum += score.correct * w;
      weightedMax += score.total * w;
    }
    const weightedPct = Math.round((weightedSum / weightedMax) * 100);

    // Critical gaps
    const gaps: {domain: string, level: string}[] = [];
    const strengths: string[] = [];
    for (const [domain, score] of Object.entries(domainScores)) {
      const ratio = score.correct / score.total;
      if (ratio >= 0.8) strengths.push(domain);
      
      if (critical.includes(domain) && ratio < 0.5) gaps.push({ domain, level: "critical" });
      else if (ratio < 0.5) gaps.push({ domain, level: "moderate" });
      else if (ratio < 0.7) gaps.push({ domain, level: "minor" });
    }

    const topGrowthAreas = gaps.map(g => g.domain).slice(0, 3);
    const topStrengths = strengths.slice(0, 3);

    // Readiness level
    const criticalGaps = gaps.filter(g => g.level === "critical").length;
    let level;
    if (weightedPct <= 40 || criticalGaps >= 3) level = 1;
    else if (weightedPct <= 55 || criticalGaps >= 2) level = 2;
    else if (weightedPct <= 70) level = 3;
    else if (weightedPct <= 85) level = 4;
    else level = 5;

    // Parent scores
    const habits = [1,2,3,4,5].reduce((s, i) => s + (Number(responses[`P${i}`]) || 3), 0);
    const confidence = [6,7,8,9,10].reduce((s, i) => s + (Number(responses[`P${i}`]) || 3), 0);
    const independence = [11,12].reduce((s, i) => s + (Number(responses[`P${i}`]) || 3), 0);
    const concern = Number(responses["P13"]) || 3;

    const reportData = {
      overallScore: pct,
      weightedPct,
      readinessLevel: LEVEL_LABELS[level],
      topStrengths,
      topGrowthAreas,
      totalCorrect,
      habits,
      confidence,
      independence,
      concern,
      domainScores
    };

    // SAVE TO SUPABASE
    let dbStatus = "Not attempted";
    let dbError = null;
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' && user) {
      dbStatus = "Attempting to save...";
      
      // Generate UUIDs upfront so we don't need .select() which gets blocked by RLS
      const parentId = crypto.randomUUID();
      const studentId = crypto.randomUUID();

      // 1. Insert Parent
      const { error: parentError } = await supabaseAdmin
        .from('parents')
        .insert({
          id: parentId,
          parent_name: user.parentName,
          email: user.email,
          phone: user.phone
        });

      if (parentError) {
        console.error("Supabase Parent Insert Error:", parentError);
        dbError = parentError;
      } else {
        // 2. Insert Student
        const { error: studentError } = await supabaseAdmin
          .from('students')
          .insert({
            id: studentId,
            parent_id: parentId,
            student_name: user.studentName,
            grade_level: user.gradeLevel
          });

        if (studentError) {
          console.error("Supabase Student Insert Error:", studentError);
          dbError = studentError;
        } else {
          // 3. Insert Assessment Results
          const { error: assessmentError } = await supabaseAdmin
            .from('assessments')
            .insert({
              student_id: studentId,
              responses,
              overall_score: reportData.weightedPct,
              foundation_score: reportData.overallScore, // Reusing column for total pct
              grade_score: reportData.totalCorrect,      // Reusing column for total correct
              readiness_level: reportData.readinessLevel,
              challenge_result: `Habits: ${habits}, Confidence: ${confidence}`,
              top_strengths: reportData.topStrengths,
              top_growth_areas: reportData.topGrowthAreas
            });

          if (assessmentError) {
            console.error("Supabase Assessment Insert Error:", assessmentError);
            dbError = assessmentError;
          } else {
            dbStatus = "Saved successfully";
          }
        }
      }
    } else {
      console.warn("Supabase URL missing or set to placeholder. Results not saved to DB.");
      dbStatus = "Missing URL or User Data";
    }

    // SEND EMAIL TO PARENT
    let emailStatus = "Not attempted";
    if (user && user.email) {
      const emailResult = await sendReportEmail(user, reportData);
      emailStatus = emailResult.success ? "Sent successfully" : "Failed or skipped";
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      debug: { dbStatus, dbError, emailStatus }
    });

  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json({ success: false, error: "Failed to calculate score" }, { status: 500 });
  }
}
