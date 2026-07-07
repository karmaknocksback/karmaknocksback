import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";
import { ensureAcademyDb } from "../schema";
import { awardStars, createNotification } from "../auth";

export interface Question {
  id: number; quiz_id: number; question_text: string; question_hi: string|null;
  question_type: string; options: string; correct_answer: string;
  explanation: string|null; marks: number; negative_marks: number;
  difficulty: string; hint: string|null; image_url: string|null; order_index: number;
}

export interface Quiz {
  id: number; course_id: number; title: string; title_hi: string|null;
  time_limit_minutes: number; passing_percent: number; max_attempts: number;
  cooldown_hours: number; shuffle_questions: number; shuffle_options: number;
  show_instant_feedback: number; show_explanation_after: number;
  stars_on_pass: number; stars_on_perfect: number;
}

export async function getQuizForCourse(courseId: number): Promise<Quiz|null> {
  await ensureAcademyDb();
  return dbGet<Quiz>(
    "SELECT * FROM academy_quizzes WHERE course_id=? AND is_published=1", [courseId]
  );
}

export async function getQuizQuestions(quizId: number, shuffle=true): Promise<Question[]> {
  const qs = await dbAll<Question>(
    "SELECT * FROM academy_questions WHERE quiz_id=? AND is_active=1 ORDER BY order_index ASC",
    [quizId]
  );
  if (shuffle) return qs.sort(() => Math.random() - 0.5);
  return qs;
}

export async function canAttemptQuiz(userId: number, quizId: number): Promise<{canAttempt:boolean;reason?:string;cooldownLeft?:number}> {
  const quiz = await dbGet<Quiz>("SELECT * FROM academy_quizzes WHERE id=?", [quizId]);
  if (!quiz) return {canAttempt:false,reason:"Quiz not found"};

  const attempts = await dbAll<{submitted_at:string}>(
    "SELECT submitted_at FROM academy_quiz_attempts WHERE user_id=? AND quiz_id=? AND submitted_at IS NOT NULL ORDER BY submitted_at DESC",
    [userId, quizId]
  );

  if (quiz.max_attempts > 0 && attempts.length >= quiz.max_attempts) {
    return {canAttempt:false,reason:`Maximum ${quiz.max_attempts} attempts reached`};
  }

  if (attempts.length > 0 && quiz.cooldown_hours > 0) {
    const lastAttempt = new Date(attempts[0].submitted_at);
    const cooldownEnd = new Date(lastAttempt.getTime() + quiz.cooldown_hours*3600000);
    if (new Date() < cooldownEnd) {
      const msLeft = cooldownEnd.getTime() - Date.now();
      return {canAttempt:false,reason:"Cooldown active",cooldownLeft:Math.ceil(msLeft/3600000)};
    }
  }

  return {canAttempt:true};
}

export interface AttemptResult {
  score: number; maxScore: number; percentage: number;
  passed: boolean; isPerfect: boolean;
  questionResults: {questionId:number;correct:boolean;marks:number;explanation:string|null}[];
  starsEarned: number;
}

export async function submitQuizAttempt(
  userId: number, quizId: number, courseId: number,
  answers: Record<number,string|string[]>
): Promise<AttemptResult> {
  await ensureAcademyDb();
  const quiz = await dbGet<Quiz>("SELECT * FROM academy_quizzes WHERE id=?", [quizId]);
  if (!quiz) throw new Error("Quiz not found");

  const questions = await dbAll<Question>(
    "SELECT * FROM academy_questions WHERE quiz_id=? AND is_active=1", [quizId]
  );

  let score = 0; let maxScore = 0;
  const questionResults: AttemptResult["questionResults"] = [];

  for (const q of questions) {
    maxScore += q.marks;
    const userAnswer = answers[q.id];
    const correct = checkAnswer(q, userAnswer);
    const earned = correct ? q.marks : -q.negative_marks;
    score += earned;
    questionResults.push({
      questionId: q.id, correct,
      marks: earned, explanation: q.explanation
    });
  }

  score = Math.max(0, score);
  const percentage = maxScore > 0 ? (score/maxScore)*100 : 0;
  const passed = percentage >= quiz.passing_percent;
  const isPerfect = percentage >= 100;

  // Get attempt number
  const prevAttempts = await dbGet<{cnt:number}>(
    "SELECT COUNT(*) as cnt FROM academy_quiz_attempts WHERE user_id=? AND quiz_id=?",
    [userId, quizId]
  );
  const attemptNum = (prevAttempts?.cnt||0) + 1;

  await dbRun(
    `INSERT INTO academy_quiz_attempts (user_id,quiz_id,course_id,answers,score,max_score,percentage,passed,attempt_number,submitted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [userId, quizId, courseId, JSON.stringify(answers), score, maxScore, percentage, passed?1:0, attemptNum, nowIso()]
  );

  // Award stars
  let starsEarned = 0;
  if (passed) {
    starsEarned = isPerfect ? quiz.stars_on_perfect : quiz.stars_on_pass;
    await awardStars(userId, starsEarned,
      isPerfect ? "Perfect score on quiz!" : "Passed quiz",
      "quiz", quizId, "quiz"
    );
    await createNotification(userId, "quiz_passed",
      passed ? "Quiz Passed! 🎉" : "",
      `You scored ${percentage.toFixed(1)}%! Earned ${starsEarned} stars ⭐`,
      `/academy/courses`
    );
  }

  return {score,maxScore,percentage,passed,isPerfect,questionResults,starsEarned};
}

function checkAnswer(q: Question, userAnswer: string|string[]|undefined): boolean {
  if (!userAnswer) return false;
  const correct = JSON.parse(q.correct_answer);
  if (q.question_type === "multiple") {
    if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false;
    return correct.length === userAnswer.length &&
      correct.every((c:string) => userAnswer.includes(c));
  }
  return String(userAnswer).trim().toLowerCase() === String(correct).trim().toLowerCase();
}

export async function getUserQuizHistory(userId: number, quizId: number) {
  return dbAll<{id:number;percentage:number;passed:number;attempt_number:number;submitted_at:string}>(
    "SELECT id,percentage,passed,attempt_number,submitted_at FROM academy_quiz_attempts WHERE user_id=? AND quiz_id=? ORDER BY attempt_number DESC",
    [userId, quizId]
  );
}
