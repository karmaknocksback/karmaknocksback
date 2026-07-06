"use client";
import { useState } from "react";

interface Story { id:string; title:string; hi:string; emoji:string; color:string; pages:Page[]; }
interface Page { id:string; scene:string; text:string; emoji:string; choices?:Choice[]; karma?:number; }
interface Choice { text:string; hi:string; emoji:string; nextPage:string; karma:number; good:boolean; }

const STORIES: Story[] = [
  {
    id:"mahavir",title:"Lord Mahavir and the Farmer",hi:"महावीर और किसान",emoji:"🦚",color:"#FF9800",
    pages:[
      {id:"p1",scene:"A peaceful morning in ancient India. Young Vardhamana is meditating under a tree.",emoji:"🧘",text:"Young Vardhamana sits in deep meditation. A farmer walks by, angry that his meditation is blocking his path to the field.",
        choices:[
          {text:"Vardhamana apologizes and moves",hi:"क्षमा मांगें",emoji:"🙏",nextPage:"p2a",karma:15,good:true},
          {text:"Vardhamana ignores the farmer",hi:"ध्यान में रहें",emoji:"😐",nextPage:"p2b",karma:5,good:true},
        ]},
      {id:"p2a",scene:"The farmer is surprised by the humble prince.",emoji:"😊",text:"The farmer is moved by such humility from a prince. He bows and says, 'Forgive me for disturbing you, sir.' Vardhamana smiles. Kindness creates kindness.",karma:15},
      {id:"p2b",scene:"The farmer leaves frustrated. But later...",emoji:"🌅",text:"Later, the farmer sees Vardhamana heal a sick animal nearby. His heart melts. 'This man is truly special,' he thinks. Actions speak louder than words.",karma:5},
      {id:"p3",scene:"Years later, Vardhamana becomes Lord Mahavir.",emoji:"🌟",text:"By practicing ahimsa, truth, and compassion every single day, Vardhamana achieves Kevalgyan — infinite knowledge! He becomes Lord Mahavir, the 24th Tirthankar! 🙏",karma:30},
    ]
  },
  {
    id:"chandanbala",title:"The Story of Chandanbala",hi:"चंदनबाला की कथा",emoji:"🌸",color:"#E91E63",
    pages:[
      {id:"p1",scene:"A princess named Chandanbala has been enslaved by a cruel merchant.",emoji:"😢",text:"Beautiful Chandanbala is chained and given no food for days. She prays peacefully despite her suffering. Lord Mahavir arrives at the door...",
        choices:[
          {text:"Chandanbala offers her last handful of stale beans",hi:"सब कुछ दे दो",emoji:"💝",nextPage:"p2a",karma:30,good:true},
          {text:"Chandanbala hides her food, she needs it",hi:"छुपा लो",emoji:"😔",nextPage:"p2b",karma:2,good:false},
        ]},
      {id:"p2a",scene:"The moment she gives with a pure heart...",emoji:"✨",text:"The moment Chandanbala gives her last food with total love and no expectation — the chains miraculously break! Her purity frees her. Lord Mahavir accepts her offering. Her karma burns away instantly!",karma:30},
      {id:"p2b",scene:"She eats, but feels empty inside...",emoji:"😔",text:"She keeps the food but her heart feels heavier. Giving from fear instead of love adds karma. Lord Mahavir passes by. A chance for liberation is missed... for now.",karma:2},
      {id:"p3",scene:"Chandanbala becomes the first head of Jain nuns.",emoji:"🌸",text:"Chandanbala's purity and faith are so great that she becomes the head of Lord Mahavir's community of nuns. She teaches thousands the path of ahimsa and courage! 🌸",karma:20},
    ]
  },
  {
    id:"ant",title:"Chintu and the Ant",hi:"चींटी की मदद",emoji:"🐜",color:"#4CAF50",
    pages:[
      {id:"p1",scene:"Chintu is rushing to school when he notices something...",emoji:"😰",text:"Chintu is already late for school! Suddenly he sees a large ant struggling in a puddle of water, about to drown. He has only 2 minutes...",
        choices:[
          {text:"Stop and gently save the ant",hi:"चींटी बचाओ",emoji:"🐜",nextPage:"p2a",karma:25,good:true},
          {text:"Keep running — can't be late!",hi:"देर हो जाएगी",emoji:"🏃",nextPage:"p2b",karma:-5,good:false},
        ]},
      {id:"p2a",scene:"Chintu carefully picks up a leaf...",emoji:"🍃",text:"Chintu places a leaf in the water. The ant climbs on. He gently moves it to dry ground. The ant waves her antennae as if saying thank you! Chintu runs fast — and actually reaches school on time! Karma works quickly! 🌟",karma:25},
      {id:"p2b",scene:"Chintu runs past...",emoji:"💔",text:"Chintu keeps running. He arrives at school, but all day he feels uncomfortable. At lunch he tells his friend. His friend says: 'Jain dharma says every life is sacred — even that tiny ant!' Chintu decides to be better tomorrow.",karma:-5},
      {id:"p3",scene:"What Chintu learned that day...",emoji:"🌸",text:"That evening, Chintu said the Navkar Mantra and thought about the tiny ant. He understood: 'A soul that could not fight the flood — I was the biggest thing in that ant's world. Ahimsa is the greatest power!' ✨",karma:20},
    ]
  }
];

export default function JainStoryAdventures() {
  const [selectedStory, setSelectedStory] = useState<Story|null>(null);
  const [pageId, setPageId] = useState("p1");
  const [karma, setKarma] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function selectStory(s:Story){setSelectedStory(s);setPageId("p1");setKarma(0);setChoices([]);setDone(false);}

  function choose(c:Choice){
    setKarma(k=>k+c.karma);
    setChoices(ch=>[...ch,c.text]);
    setPageId(c.nextPage);
    // Auto advance to final page after choice page
    const next = selectedStory?.pages.find(p=>p.id===c.nextPage);
    if(next&&!next.choices){
      setTimeout(()=>{
        const finalIdx = selectedStory?.pages.findLastIndex(p=>p.id==="p3")||2;
        setPageId(selectedStory?.pages[finalIdx]?.id||c.nextPage);
        setTimeout(()=>setDone(true),2000);
      },2500);
    }
  }

  function advancePage(){
    if(!selectedStory)return;
    const cur=selectedStory.pages.findIndex(p=>p.id===pageId);
    if(cur<selectedStory.pages.length-1){
      setPageId(selectedStory.pages[cur+1].id);
      if(cur+1===selectedStory.pages.length-1)setDone(true);
    }
  }

  const page = selectedStory?.pages.find(p=>p.id===pageId);

  if(!selectedStory) return (
    <div className="flex flex-col items-center px-3 pb-10">
      <p className="font-hindi text-sm text-white/50 mb-6 mt-2 text-center">Choose a Jain story to explore!</p>
      <div className="grid gap-4 w-full max-w-lg">
        {STORIES.map(s=>(
          <button key={s.id} onClick={()=>selectStory(s)}
            className="rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{background:`linear-gradient(135deg,${s.color}18,${s.color}08)`,border:`1.5px solid ${s.color}40`,boxShadow:`0 4px 20px ${s.color}15`}}>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{s.emoji}</span>
              <div>
                <p className="font-sans font-black text-white text-base">{s.title}</p>
                <p className="font-display-hi text-sm" style={{color:s.color}}>{s.hi}</p>
                <p className="font-sans text-xs text-white/40 mt-1">Choose your path · Multiple endings</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if(!page) return null;
  const s = selectedStory;

  return (
    <div className="flex flex-col items-center px-3 pb-10 max-w-lg mx-auto">
      {/* Story header */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <button onClick={()=>setSelectedStory(null)} className="font-sans text-xs text-white/40 hover:text-white/70">← Stories</button>
        <span className="text-white/20">/</span>
        <span className="font-sans text-xs font-bold" style={{color:s.color}}>{s.title}</span>
        <div className="ml-auto font-sans text-xs text-yellow-300">⭐ {karma}</div>
      </div>

      {/* Story scene */}
      <div className="w-full rounded-2xl overflow-hidden mb-4" style={{background:`linear-gradient(135deg,${s.color}15,rgba(0,0,0,0.4))`,border:`1.5px solid ${s.color}30`}}>
        {/* Scene image area */}
        <div className="relative h-40 flex items-center justify-center"
          style={{background:`linear-gradient(180deg,${s.color}20,transparent)`}}>
          <div className="text-7xl" style={{filter:`drop-shadow(0 0 20px ${s.color}60)`,animation:"float 3s ease-in-out infinite"}}>
            {page.emoji}
          </div>
          <p className="absolute bottom-2 left-0 right-0 text-center font-sans text-xs text-white/40 italic">{page.scene}</p>
        </div>
        {/* Story text */}
        <div className="p-5">
          <p className="font-hindi text-sm leading-relaxed text-white/90">{page.text}</p>
          {page.karma && !page.choices && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1" style={{background:`${s.color}25`,border:`1px solid ${s.color}40`}}>
              <span className="font-sans text-xs font-bold" style={{color:s.color}}>+{page.karma} Karma ✨</span>
            </div>
          )}
        </div>
      </div>

      {/* Choices or advance */}
      {page.choices ? (
        <div className="w-full space-y-3">
          <p className="font-sans text-xs text-white/50 text-center mb-2">What do you choose?</p>
          {page.choices.map(c=>(
            <button key={c.text} onClick={()=>choose(c)}
              className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95"
              style={{background:c.good?"rgba(76,175,80,0.12)":"rgba(244,67,54,0.08)",border:`1.5px solid ${c.good?"rgba(76,175,80,0.35)":"rgba(244,67,54,0.25)"}`}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="font-sans text-sm font-bold text-white">{c.text}</p>
                  <p className="font-hindi text-xs" style={{color:c.good?"#4CAF50":"#EF5350"}}>{c.hi}</p>
                </div>
                <div className="ml-auto font-sans text-xs font-bold" style={{color:c.good?"#4CAF50":"#EF5350"}}>
                  {c.karma>0?`+${c.karma}`:c.karma} ⭐
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : done ? (
        <div className="w-full rounded-2xl p-6 text-center" style={{background:"linear-gradient(135deg,#fffde7,#fff9c4)",border:"2px solid #FFD700"}}>
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-sans text-xl font-black text-yellow-300 mb-2">Story Complete!</h3>
          <p className="font-sans text-sm text-yellow-200 mb-1">Total Karma: ⭐ {karma}</p>
          <p className="font-hindi text-xs text-white/50 mb-5">तुमने {s.hi} की कहानी पूरी की!</p>
          <div className="flex gap-3 justify-center">
            <button onClick={()=>setSelectedStory(null)} className="px-5 py-2.5 rounded-full font-sans text-xs font-black" style={{background:"rgba(255,255,255,0.1)",color:"#1a1a1a"}}>← More Stories</button>
            <button onClick={()=>selectStory(s)} className="px-5 py-2.5 rounded-full font-sans text-xs font-black" style={{background:`linear-gradient(135deg,${s.color},#FFD700)`,color:"#1a0800"}}>Play Again ↺</button>
          </div>
        </div>
      ) : (
        <button onClick={advancePage} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:`linear-gradient(135deg,${s.color},#FFD700)`,color:"#1a0800"}}>
          Continue → 
        </button>
      )}
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}
