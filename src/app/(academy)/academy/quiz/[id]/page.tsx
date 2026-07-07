"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Question { id:number;question_text:string;question_hi:string|null;question_type:string;options:string[];marks:number;hint:string|null;image_url:string|null; }
interface QuizData { quiz:{id:number;title:string;title_hi:string|null;time_limit_minutes:number;passing_percent:number;max_attempts:number};questions:Question[]; }

type PhaseType = "loading"|"blocked"|"intro"|"quiz"|"result";

interface Result { score:number;maxScore:number;percentage:number;passed:boolean;isPerfect:boolean;starsEarned:number;questionResults:{questionId:number;correct:boolean;explanation:string|null}[]; }

export default function QuizPage() {
  const { id } = useParams<{id:string}>();
  const sp = useSearchParams();
  const router = useRouter();
  const courseId = sp.get("course") || "0";
  const token = typeof window !== "undefined" ? localStorage.getItem("academy_token") : null;

  const [phase, setPhase] = useState<PhaseType>("loading");
  const [quizData, setQuizData] = useState<QuizData|null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number,string|string[]>>({});
  const [result, setResult] = useState<Result|null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [blockMsg, setBlockMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { router.push("/academy/login"); return; }
    // Check can attempt
    fetch(`/api/academy/quiz/${id}/attempt`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body: JSON.stringify({courseId:Number(courseId),check:true}) })
      .then(r=>r.json()).then(d => {
        if (!d.canAttempt) { setBlockMsg(d.reason||"Cannot attempt quiz"); setPhase("blocked"); return; }
        fetch(`/api/academy/quiz/${id}`, { headers:{Authorization:`Bearer ${token}`} })
          .then(r=>r.json()).then(d => { setQuizData(d); setTimeLeft(d.quiz.time_limit_minutes*60); setPhase("intro"); });
      });
  }, [id, courseId, token, router]);

  const handleSubmit = useCallback(async () => {
    if (!token || !quizData || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/academy/quiz/${id}/submit`, {
      method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body: JSON.stringify({ courseId:Number(courseId), answers })
    });
    const data = await res.json();
    setResult(data); setPhase("result"); setSubmitting(false);
  }, [token, quizData, id, courseId, answers, submitting]);

  // Timer
  useEffect(() => {
    if (phase!=="quiz" || !quizData?.quiz.time_limit_minutes) return;
    if (timeLeft<=0) { handleSubmit(); return; }
    const t = setInterval(()=>setTimeLeft(s=>s-1),1000);
    return ()=>clearInterval(t);
  }, [phase, timeLeft, quizData, handleSubmit]);

  const q = quizData?.questions[current];

  function selectAnswer(qId: number, val: string, multi: boolean) {
    if (multi) {
      setAnswers(prev => {
        const cur = (prev[qId] as string[]) || [];
        return {...prev, [qId]: cur.includes(val) ? cur.filter(v=>v!==val) : [...cur,val]};
      });
    } else {
      setAnswers(prev => ({...prev, [qId]: val}));
    }
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (phase==="loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-5xl animate-bounce">🧠</div></div>;

  if (phase==="blocked") return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-sm bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-sans font-black text-xl text-gray-800 mb-2">Cannot Attempt Quiz</h2>
        <p className="font-sans text-sm text-gray-500 mb-4">{blockMsg}</p>
        <Link href={`/academy/courses`} className="px-6 py-2.5 rounded-2xl font-sans font-black text-sm text-amber-900 inline-block" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Back to Courses</Link>
      </div>
    </div>
  );

  if (phase==="intro" && quizData) return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-sm bg-white rounded-3xl p-8 shadow-xl" style={{border:"2px solid rgba(255,215,0,0.3)"}}>
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="font-display-hi text-2xl font-black text-amber-900 mb-2">{quizData.quiz.title}</h2>
        <div className="grid grid-cols-3 gap-3 my-6">
          {[{l:"Questions",v:quizData.questions.length},{l:"Time",v:quizData.quiz.time_limit_minutes?`${quizData.quiz.time_limit_minutes} min`:"Unlimited"},{l:"Pass %",v:`${quizData.quiz.passing_percent}%`}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 bg-amber-50">
              <p className="font-display text-xl font-black text-amber-800">{s.v}</p>
              <p className="font-sans text-[10px] text-gray-500">{s.l}</p>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase("quiz")} className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Start Quiz →</button>
      </div>
    </div>
  );

  if (phase==="result" && result) return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-20">
      <div className={`rounded-3xl p-8 text-center mb-6 ${result.passed?"bg-green-50 border-2 border-green-400":"bg-red-50 border-2 border-red-300"}`}>
        <div className="text-7xl mb-4">{result.isPerfect?"💯":result.passed?"🎉":"😔"}</div>
        <h2 className="font-display-hi text-3xl font-black mb-2" style={{color:result.passed?"#1B5E20":"#B71C1C"}}>
          {result.isPerfect?"Perfect Score!":result.passed?"Quiz Passed!":"Try Again"}
        </h2>
        <div className="grid grid-cols-3 gap-3 my-6">
          {[{l:"Score",v:`${result.score}/${result.maxScore}`},{l:"Percent",v:`${result.percentage.toFixed(1)}%`},{l:"Stars",v:`+${result.starsEarned}⭐`}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 bg-white">
              <p className="font-display text-xl font-black text-gray-800">{s.v}</p>
              <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        {result.passed && <p className="font-hindi text-sm text-green-700 mb-2">🏅 Certificate is being generated!</p>}
        <div className="flex gap-3 justify-center">
          <Link href="/academy/courses" className="px-5 py-2.5 rounded-2xl font-sans font-black text-xs bg-white border-2 border-amber-300 text-amber-700">← Courses</Link>
          <Link href="/academy/dashboard" className="px-5 py-2.5 rounded-2xl font-sans font-black text-xs text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Dashboard ⭐</Link>
        </div>
      </div>
    </div>
  );

  if (phase==="quiz" && q && quizData) return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl px-4 py-3 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.3)"}}>
        <div>
          <p className="font-sans text-xs font-bold text-gray-500">Question {current+1} / {quizData.questions.length}</p>
          <div className="flex mt-1 gap-0.5">
            {quizData.questions.map((_,i)=>(
              <div key={i} className="h-1.5 flex-1 rounded-full" style={{background:i===current?"#FFD700":answers[quizData.questions[i].id]?"#4CAF50":"#E0E0E0"}}/>
            ))}
          </div>
        </div>
        {quizData.quiz.time_limit_minutes > 0 && (
          <div className="text-right">
            <p className="font-display text-xl font-black" style={{color:timeLeft<60?"#EF5350":"#2196F3"}}>{formatTime(timeLeft)}</p>
            <p className="font-sans text-[10px] text-gray-400">Time left</p>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
        {q.image_url && <img src={q.image_url} alt="" className="w-full rounded-xl mb-4 max-h-40 object-cover"/>}
        <p className="font-sans font-black text-base text-gray-800 leading-relaxed mb-1">{q.question_text}</p>
        {q.question_hi && <p className="font-hindi text-sm text-amber-700 mb-4">{q.question_hi}</p>}
        <p className="font-sans text-[10px] text-gray-400 mb-4">{q.question_type==="multiple"?"Select all that apply":"Select one answer"} · {q.marks} mark{q.marks!==1?"s":""}</p>

        <div className="space-y-2.5">
          {q.options.map((opt,oi)=>{
            const multi = q.question_type==="multiple";
            const curAns = answers[q.id];
            const sel = multi ? (curAns as string[]||[]).includes(opt) : curAns===opt;
            return (
              <button key={oi} onClick={()=>selectAnswer(q.id,opt,multi)}
                className="w-full text-left rounded-xl px-4 py-3 transition-all font-sans text-sm"
                style={{
                  background:sel?"linear-gradient(135deg,#FFF9C4,#FFF3E0)":"#FAFAFA",
                  border:`2px solid ${sel?"#FFD700":"#E0E0E0"}`,
                  boxShadow:sel?"0 4px 12px rgba(255,215,0,0.3)":"none",
                }}>
                <span className="font-black mr-2" style={{color:sel?"#E65100":"#999"}}>{["A","B","C","D"][oi]}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {q.hint && <p className="mt-3 font-sans text-xs text-blue-600 bg-blue-50 rounded-lg p-2">💡 Hint: {q.hint}</p>}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {current > 0 && <button onClick={()=>setCurrent(c=>c-1)} className="px-5 py-2.5 rounded-2xl font-sans font-black text-sm bg-white border-2 border-gray-200 text-gray-600">← Prev</button>}
        <div className="flex-1"/>
        {current < quizData.questions.length-1 ? (
          <button onClick={()=>setCurrent(c=>c+1)} className="px-6 py-2.5 rounded-2xl font-sans font-black text-sm text-amber-900" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Next →</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 rounded-2xl font-sans font-black text-sm text-white disabled:opacity-60" style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
            {submitting ? "Submitting..." : "Submit Quiz ✓"}
          </button>
        )}
      </div>
    </div>
  );

  return null;
}
