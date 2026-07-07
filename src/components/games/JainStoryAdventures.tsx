"use client";
import { useState } from "react";
import Image from "next/image";

interface Story{id:string;title:string;hi:string;emoji:string;color:string;coverImg:string;pages:Page[];}
interface Page{id:string;img:string;text:string;choices?:Choice[];karma?:number;}
interface Choice{text:string;hi:string;emoji:string;nextPage:string;karma:number;good:boolean;}

const STORIES:Story[]=[
  {id:"mahavir",title:"Lord Mahavir & the Farmer",hi:"महावीर और किसान",emoji:"🦚",color:"#FF9800",coverImg:"/games/story/mahavir.jpg",
   pages:[
     {id:"p1",img:"/games/story/mahavir.jpg",text:"Young Vardhamana sits deep in meditation under a tree. A farmer approaches, frustrated that the meditating prince is blocking his path to the field.",
      choices:[
        {text:"Vardhamana apologizes and moves aside",hi:"क्षमा मांगें और हटें",emoji:"🙏",nextPage:"p2a",karma:15,good:true},
        {text:"Vardhamana stays still in meditation",hi:"ध्यान में रहें",emoji:"😐",nextPage:"p2b",karma:5,good:true},
      ]},
     {id:"p2a",img:"/games/story/learning.jpg",text:"The farmer is deeply moved by such humility from a prince. He bows respectfully. Vardhamana smiles warmly. Kindness creates kindness everywhere!",karma:15},
     {id:"p2b",img:"/games/story/mahavir.jpg",text:"The farmer walks away, but later sees Vardhamana helping a sick deer nearby. His heart melts completely. Actions speak louder than words!",karma:5},
     {id:"p3",img:"/games/story/happy_end.jpg",text:"By practicing ahimsa, truth, and compassion every single day, Vardhamana achieves Kevalgyan — infinite knowledge! He becomes Lord Mahavir, the 24th Tirthankar! 🙏",karma:30},
   ]},
  {id:"chandanbala",title:"The Story of Chandanbala",hi:"चंदनबाला की कथा",emoji:"🌸",color:"#E91E63",coverImg:"/games/story/chandanbala.jpg",
   pages:[
     {id:"p1",img:"/games/story/chandanbala.jpg",text:"Chandanbala has been enslaved and given no food for days. Lord Mahavir arrives at the door. She holds her last handful of stale beans...",
      choices:[
        {text:"Give the last food with pure love",hi:"सब कुछ दे दो",emoji:"💝",nextPage:"p2a",karma:30,good:true},
        {text:"Keep the food — she needs it",hi:"रख लो",emoji:"😔",nextPage:"p2b",karma:-5,good:false},
      ]},
     {id:"p2a",img:"/games/story/happy_end.jpg",text:"The moment she gives with a completely pure heart — her chains miraculously break! Her purity sets her free. Lord Mahavir accepts her offering with love!",karma:30},
     {id:"p2b",img:"/games/story/learning.jpg",text:"She keeps the food but her heart feels heavier. Giving from fear instead of love creates karma. A chance for liberation is missed... for now.",karma:-5},
     {id:"p3",img:"/games/story/happy_end.jpg",text:"Chandanbala's purity and faith are so great that she becomes the head of Lord Mahavir's community of nuns. She teaches thousands the path of ahimsa! 🌸",karma:20},
   ]},
  {id:"ant",title:"Chintu and the Ant",hi:"चींटी की मदद",emoji:"🐜",color:"#4CAF50",coverImg:"/games/story/chintu_school.jpg",
   pages:[
     {id:"p1",img:"/games/story/chintu_school.jpg",text:"Chintu is late for school! Suddenly he sees a tiny ant struggling in a puddle, about to drown. He has only 2 minutes...",
      choices:[
        {text:"Stop and gently save the ant with a leaf",hi:"चींटी बचाओ",emoji:"🐜",nextPage:"p2a",karma:25,good:true},
        {text:"Keep running — can't be late!",hi:"देर हो जाएगी",emoji:"🏃",nextPage:"p2b",karma:-5,good:false},
      ]},
     {id:"p2a",img:"/games/story/happy_end.jpg",text:"Chintu places a leaf in the water. The ant climbs on. He gently moves it to dry ground. The ant waves her antennae as if saying thank you! Chintu actually reaches school on time — karma works fast! 🌟",karma:25},
     {id:"p2b",img:"/games/story/learning.jpg",text:"Chintu runs past. At lunch his friend says: 'Jain dharma says every life is sacred — even that tiny ant!' Chintu decides to be better tomorrow. Learning is also karma!",karma:-5},
     {id:"p3",img:"/games/story/happy_end.jpg",text:"That evening, Chintu said the Navkar Mantra and understood: 'I was the biggest force in that ant's world. Ahimsa is the greatest power!' ✨",karma:20},
   ]},
];

export default function JainStoryAdventures(){
  const[story,setStory]=useState<Story|null>(null);
  const[pageId,setPageId]=useState("p1");
  const[karma,setKarma]=useState(0);
  const[done,setDone]=useState(false);

  function selectStory(s:Story){setStory(s);setPageId("p1");setKarma(0);setDone(false);}
  function choose(c:Choice){
    setKarma(k=>k+c.karma);setPageId(c.nextPage);
    const next=story?.pages.find(p=>p.id===c.nextPage);
    if(next&&!next.choices){setTimeout(()=>{
      const last=story?.pages[story.pages.length-1];
      if(last)setPageId(last.id);
      setTimeout(()=>setDone(true),2000);
    },2500);}
  }
  function advance(){
    if(!story)return;
    const cur=story.pages.findIndex(p=>p.id===pageId);
    if(cur<story.pages.length-1){
      setPageId(story.pages[cur+1].id);
      if(cur+1===story.pages.length-1)setTimeout(()=>setDone(true),500);
    }
  }

  const page=story?.pages.find(p=>p.id===pageId);

  if(!story) return (
    <div className="flex flex-col items-center px-4 pb-10">
      <p className="font-hindi text-sm text-gray-500 mb-5 mt-2 text-center">एक जैन कथा चुनें!</p>
      <div className="grid gap-4 w-full max-w-lg">
        {STORIES.map(s=>(
          <button key={s.id} onClick={()=>selectStory(s)}
            className="rounded-3xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{boxShadow:`0 8px 24px ${s.color}30, 0 0 0 3px ${s.color}30`}}>
            <div className="relative h-40">
              <Image src={s.coverImg} alt={s.title} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.65))"}}/>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-sans font-black text-white text-lg">{s.title}</p>
                <p className="font-display-hi text-sm" style={{color:s.color}}>{s.hi}</p>
                <p className="font-sans text-xs text-white/60 mt-1">{s.emoji} Choose your path · Multiple endings</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if(!page) return null;

  return (
    <div className="flex flex-col items-center px-4 pb-10 max-w-lg mx-auto">
      {/* Back + karma */}
      <div className="flex items-center gap-2 mb-4 mt-2 w-full">
        <button onClick={()=>setStory(null)} className="font-sans text-xs rounded-full px-3 py-1.5" style={{background:"white",color:"#555",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>← Stories</button>
        <span className="font-sans text-xs font-bold" style={{color:story.color}}>{story.title}</span>
        <div className="ml-auto font-sans text-xs font-black text-yellow-600">⭐ {karma}</div>
      </div>

      {/* Story scene — big image */}
      <div className="w-full rounded-3xl overflow-hidden mb-4" style={{boxShadow:`0 8px 32px ${story.color}30, 0 0 0 3px ${story.color}40`}}>
        <div className="relative h-52">
          <Image src={page.img} alt="scene" fill className="object-cover" unoptimized style={{transition:"all 0.5s"}} sizes="(max-width:768px)100vw,500px"/>
          <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.6))"}}/>
        </div>
        <div className="p-5" style={{background:"white"}}>
          <p className="font-hindi text-sm leading-relaxed text-gray-700">{page.text}</p>
          {page.karma&&!page.choices&&(
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1" style={{background:`${story.color}18`,border:`1px solid ${story.color}40`}}>
              <span className="font-sans text-xs font-black" style={{color:story.color}}>+{page.karma} Karma ✨</span>
            </div>
          )}
        </div>
      </div>

      {/* Choices or advance */}
      {page.choices?(
        <div className="w-full space-y-3">
          <p className="font-sans text-xs text-gray-400 text-center mb-2">What do you choose?</p>
          {page.choices.map(c=>(
            <button key={c.text} onClick={()=>choose(c)}
              className="w-full rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-95"
              style={{border:`3px solid ${c.good?"#4CAF50":"#EF5350"}`,boxShadow:`0 4px 16px rgba(${c.good?"76,175,80":"239,83,80"},0.2)`}}>
              <div className="flex items-center gap-3 p-4" style={{background:c.good?"#E8F5E9":"#FFEBEE"}}>
                <span className="text-3xl">{c.emoji}</span>
                <div className="flex-1">
                  <p className="font-sans text-sm font-black" style={{color:c.good?"#1B5E20":"#B71C1C"}}>{c.text}</p>
                  <p className="font-display-hi text-xs" style={{color:c.good?"#388E3C":"#C62828"}}>{c.hi}</p>
                </div>
                <div className="font-sans text-sm font-black" style={{color:c.good?"#4CAF50":"#EF5350"}}>{c.karma>0?"+":""}{ c.karma} ⭐</div>
              </div>
            </button>
          ))}
        </div>
      ):done?(
        <div className="w-full rounded-3xl overflow-hidden" style={{border:"3px solid #FFD700",boxShadow:"0 16px 48px rgba(255,215,0,0.4)"}}>
          <div className="relative h-36">
            <Image src="/games/chintu/celebrate.jpg" alt="done" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
          </div>
          <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
            <h3 className="font-sans text-xl font-black text-yellow-700 mb-1">Story Complete! 🏆</h3>
            <p className="font-sans text-sm text-yellow-600 mb-4">Karma earned: ⭐ {karma}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>setStory(null)} className="px-5 py-2.5 rounded-full font-sans text-xs font-black" style={{background:"rgba(0,0,0,0.08)",color:"#555"}}>← More Stories</button>
              <button onClick={()=>selectStory(story)} className="px-5 py-2.5 rounded-full font-sans text-xs font-black text-white" style={{background:`linear-gradient(135deg,${story.color},#FFD700)`}}>Play Again ↺</button>
            </div>
          </div>
        </div>
      ):(
        <button onClick={advance} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
          style={{background:`linear-gradient(135deg,${story.color},#FFD700)`,boxShadow:`0 6px 20px ${story.color}50`}}>
          Continue →
        </button>
      )}
    </div>
  );
}
