"use client";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { playSound } from "@/lib/sounds";

const AVATARS = ["🧒","👦","👧","🧑","👨","👩","🧑‍🎓","👶","🧕","🧔"];

export default function PlayerModal({onDone}:{onDone?:()=>void}){
  const {setPlayer}=usePlayer();
  const [name,setName]=useState("");
  const [avatar,setAvatar]=useState("🧒");

  function save(){
    if(!name.trim())return;
    playSound.win();
    setPlayer({name:name.trim(),avatar});
    onDone?.();
  }

  return(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)"}}>
      <div className="rounded-3xl overflow-hidden w-full max-w-sm"
        style={{background:"white",border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.5)",animation:"popIn 0.35s ease"}}>
        {/* Header */}
        <div className="px-6 pt-7 pb-4 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
          <div className="text-5xl mb-2">🎮</div>
          <h2 className="font-sans font-black text-xl text-amber-900">Welcome to Karma Kids World!</h2>
          <p className="font-hindi text-sm text-amber-600 mt-1">अपना नाम दर्ज करें और खेलें!</p>
        </div>
        <div className="p-5">
          {/* Avatar picker */}
          <p className="font-sans text-xs font-black text-gray-600 mb-2">Choose your avatar:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {AVATARS.map(a=>(
              <button key={a} onClick={()=>{playSound.click();setAvatar(a);}}
                className="w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110"
                style={{background:avatar===a?"linear-gradient(135deg,#FFD700,#FF9800)":"#F5F5F5",
                  border:`2px solid ${avatar===a?"#FF9800":"transparent"}`,
                  boxShadow:avatar===a?"0 4px 12px rgba(255,152,0,0.5)":"none"}}>
                {a}
              </button>
            ))}
          </div>
          {/* Name input */}
          <label className="block font-sans text-xs font-black text-gray-600 mb-2">Your Name / आपका नाम</label>
          <input type="text" placeholder="e.g. Chintu, Priya..." maxLength={20}
            value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&save()}
            className="w-full rounded-xl px-4 py-3 font-sans text-base border-2 outline-none focus:border-amber-400 mb-4 transition-colors"
            style={{borderColor:"#E0E0E0"}} autoFocus/>
          <button onClick={save} disabled={!name.trim()}
            className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800",boxShadow:"0 4px 16px rgba(255,215,0,0.4)"}}>
            {avatar} Let&apos;s Play! →
          </button>
          <p className="text-center font-sans text-[10px] text-gray-400 mt-2">
            Saved to browser — won&apos;t ask again 🙌
          </p>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
