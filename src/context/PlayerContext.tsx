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
    try{const s=localStorage.getItem("kkb_player");if(s)setPS(JSON.parse(s));}catch{}
    setReady(true);
  },[]);
  const setPlayer=useCallback((p:Player)=>{setPS(p);try{localStorage.setItem("kkb_player",JSON.stringify(p));}catch{}},[]);
  const clearPlayer=useCallback(()=>{setPS(null);try{localStorage.removeItem("kkb_player");}catch{}},[]);
  return <Ctx.Provider value={{player,setPlayer,clearPlayer,isReady}}>{children}</Ctx.Provider>;
}
export const usePlayer=()=>useContext(Ctx);
