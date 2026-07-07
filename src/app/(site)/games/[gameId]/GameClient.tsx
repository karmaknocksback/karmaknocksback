"use client";
import React from "react";
import dynamic from "next/dynamic";

const LOADERS: Record<string,()=>React.ReactNode> = {
  "snakes-ladders": ()=><Skeleton e="🎲" c="#4CAF50"/>,
  "memory-quest":   ()=><Skeleton e="🧩" c="#9C27B0"/>,
  "daily-karma":    ()=><Skeleton e="⭐" c="#FF9800"/>,
  "tiny-rescue":    ()=><Skeleton e="🦋" c="#00BCD4"/>,
  "karma-garden":   ()=><Skeleton e="🌸" c="#E91E63"/>,
  "karma-forest":   ()=><Skeleton e="🌳" c="#388E3C"/>,
  "temptation-run": ()=><Skeleton e="🏃" c="#FF5722"/>,
  "temple-builder": ()=><Skeleton e="🕌" c="#F57F17"/>,
  "jain-stories":   ()=><Skeleton e="📖" c="#BF360C"/>,
  "aparigraha":     ()=><Skeleton e="🎒" c="#4E342E"/>,
  "compassion-city":()=><Skeleton e="🏙️" c="#0D47A1"/>,
  "karma-ludo":     ()=><Skeleton e="🎯" c="#7B1FA2"/>,
  "karma-grid":     ()=><Skeleton e="🪷" c="#7C4DFF"/>,
  "word-builder":   ()=><Skeleton e="📝" c="#9C27B0"/>,
  "karma-crush":    ()=><Skeleton e="🪷" c="#E91E63"/>,
};

function Skeleton({e,c}:{e:string;c:string}){
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-6xl" style={{animation:"bounce2 0.9s ease-in-out infinite"}}>{e}</div>
      <div className="flex gap-2">
        {[0,1,2].map(i=>(
          <div key={i} className="w-3 h-3 rounded-full"
            style={{background:c,animation:`bounce2 0.7s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>
        ))}
      </div>
      <p className="font-hindi text-sm font-bold" style={{color:c}}>खेल तैयार हो रहा है…</p>
      <style>{`@keyframes bounce2{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );
}

const GAMES: Record<string, React.ComponentType> = {
  "snakes-ladders": dynamic(()=>import("@/components/games/KarmaSnakesLadders"),{loading:LOADERS["snakes-ladders"],ssr:false}),
  "memory-quest":   dynamic(()=>import("@/components/games/NavkarMemoryQuest"),  {loading:LOADERS["memory-quest"],  ssr:false}),
  "daily-karma":    dynamic(()=>import("@/components/games/DailyKarmaGame"),     {loading:LOADERS["daily-karma"],   ssr:false}),
  "tiny-rescue":    dynamic(()=>import("@/components/games/TinyLifeRescue"),     {loading:LOADERS["tiny-rescue"],   ssr:false}),
  "karma-garden":   dynamic(()=>import("@/components/games/KarmaGarden"),        {loading:LOADERS["karma-garden"],  ssr:false}),
  "karma-forest":   dynamic(()=>import("@/components/games/KarmaForest"),        {loading:LOADERS["karma-forest"],  ssr:false}),
  "temptation-run": dynamic(()=>import("@/components/games/TemptationRun"),      {loading:LOADERS["temptation-run"],ssr:false}),
  "temple-builder": dynamic(()=>import("@/components/games/TempleBuilder"),      {loading:LOADERS["temple-builder"],ssr:false}),
  "jain-stories":   dynamic(()=>import("@/components/games/JainStoryAdventures"),{loading:LOADERS["jain-stories"],  ssr:false}),
  "aparigraha":     dynamic(()=>import("@/components/games/AparigrahaAdventure"),{loading:LOADERS["aparigraha"],    ssr:false}),
  "compassion-city":dynamic(()=>import("@/components/games/CompassionCity"),     {loading:LOADERS["compassion-city"],ssr:false}),
  "karma-ludo":     dynamic(()=>import("@/components/games/KarmaLudo"),          {loading:LOADERS["karma-ludo"],    ssr:false}),
  "karma-grid":     dynamic(()=>import("@/components/games/KarmaGrid"),          {loading:LOADERS["karma-grid"],    ssr:false}),
  "word-builder":   dynamic(()=>import("@/components/games/KarmaWordGame"),      {loading:LOADERS["word-builder"],  ssr:false}),
  "karma-crush":    dynamic(()=>import("@/components/games/KarmaCrush"),          {loading:LOADERS["karma-crush"],   ssr:false}),
};

export default function GameClient({gameId,emoji,color}:{gameId:string;emoji:string;color:string}){
  const Game=GAMES[gameId];
  if(!Game) return <Skeleton e={emoji} c={color}/>;
  return <Game/>;
}
