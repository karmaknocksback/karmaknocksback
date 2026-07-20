"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Player { name: string; avatar: string; }
interface PlayerCtx {
  player: Player|null; setPlayer:(p:Player)=>void;
  clearPlayer:()=>void; isReady:boolean;
}
const Ctx = createContext<PlayerCtx>({player:null,setPlayer:()=>{},clearPlayer:()=>{},isReady:false});

export function PlayerProvider({children}:{children:ReactNode}){
  const [player,setPS]=useState<Player|null>(null);
  const [isReady,setReady]=useState(false);
  useEffect(()=>{
    // 1. Check localStorage (guest player or previously set)
    try{const s=localStorage.getItem("kkb_player");if(s){setPS(JSON.parse(s));setReady(true);return;}}catch{}
    
    // 2. Check kkb_user cookie (set after Google/email sign-in)
    try {
      const cookieMatch = document.cookie.match(/kkb_user=([^;]+)/);
      if (cookieMatch) {
        const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
        if (userData.name) {
          const p = { name: userData.name, avatar: userData.avatar || "🧑" };
          setPS(p);
          localStorage.setItem("kkb_player", JSON.stringify(p));
          setReady(true);
          return;
        }
      }
    } catch {}
    
    // 3. Try fetching from API (fallback for existing sessions)
    fetch("/api/academy/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.name) {
          const p = { name: d.name, avatar: d.avatar || "🧑" };
          setPS(p);
          try { localStorage.setItem("kkb_player", JSON.stringify(p)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  },[]);
  const setPlayer=useCallback((p:Player)=>{setPS(p);try{localStorage.setItem("kkb_player",JSON.stringify(p));}catch{}},[]);
  const clearPlayer=useCallback(()=>{setPS(null);try{localStorage.removeItem("kkb_player");}catch{}},[]);
  return <Ctx.Provider value={{player,setPlayer,clearPlayer,isReady}}>{children}</Ctx.Provider>;
}
export const usePlayer=()=>useContext(Ctx);
