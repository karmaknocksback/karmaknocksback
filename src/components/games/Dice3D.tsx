"use client";
import { useEffect, useRef, useState } from "react";

/* ── Dot layout for each face 1–6 ── */
const DOTS: Record<number, [number,number][]> = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
};

/* ── Target rotation for each face ── */
const FACE_ROTATIONS: Record<number,{rx:number;ry:number}> = {
  1:{rx:0,ry:0},
  2:{rx:0,ry:180},
  3:{rx:0,ry:-90},
  4:{rx:0,ry:90},
  5:{rx:-90,ry:0},
  6:{rx:90,ry:0},
};

interface Props {
  size?: number;
  result?: number | null;
  rolling?: boolean;
  color?: string;
  dotColor?: string;
}

export default function Dice3D({ size=96, result=1, rolling=false, color="#fff", dotColor="#2d1a00" }: Props) {
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [rz, setRz] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const half = size / 2;

  useEffect(() => {
    if (rolling) {
      let t = 0;
      animRef.current = setInterval(() => {
        t += 1;
        setRx(r => r + 11 + Math.sin(t * 0.3) * 7);
        setRy(r => r + 13 + Math.cos(t * 0.4) * 9);
        setRz(r => r + 5);
      }, 30);
    } else {
      if (animRef.current) clearInterval(animRef.current);
      if (result) {
        const target = FACE_ROTATIONS[result];
        // Snap to target — batch these updates
        setTimeout(() => {
          setRx(prev => Math.round(prev / 360) * 360 + target.rx);
          setRy(prev => Math.round(prev / 360) * 360 + target.ry);
          setRz(0);
        }, 0);
      }
    }
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [rolling, result]);

  const s = size;
  const face = (content: React.ReactNode, transform: string, bg: string) => (
    <div style={{
      position: "absolute", width: s, height: s,
      transform, backfaceVisibility: "hidden",
      background: bg,
      borderRadius: s * 0.12,
      border: `${s*0.025}px solid rgba(0,0,0,0.18)`,
      boxShadow: `inset 0 ${s*0.04}px ${s*0.08}px rgba(255,255,255,0.6), inset 0 -${s*0.04}px ${s*0.06}px rgba(0,0,0,0.15)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {content}
    </div>
  );

  const dots = (n: number) => (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {(DOTS[n] || []).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={n===1?14:10}
          fill={dotColor}
          style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.3))` }}
        />
      ))}
    </svg>
  );

  const faceGrad = `linear-gradient(135deg, ${color} 0%, ${color}ee 50%, ${color}cc 100%)`;
  const accentColor = color === "#fff" ? "#FFD700" : "#fff";

  return (
    <div style={{
      width: s, height: s,
      perspective: s * 5,
      cursor: "pointer",
      filter: rolling ? "drop-shadow(0 0 16px rgba(255,215,0,0.7))" : `drop-shadow(0 8px 16px rgba(0,0,0,0.25))`,
      transition: "filter 0.3s",
    }}>
      <div style={{
        width: s, height: s,
        position: "relative",
        transformStyle: "preserve-3d",
        transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        transition: rolling ? "none" : "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {face(dots(1), `translateZ(${half}px)`, faceGrad)}
        {face(dots(2), `rotateY(180deg) translateZ(${half}px)`, faceGrad)}
        {face(dots(3), `rotateY(90deg) translateZ(${half}px)`, faceGrad)}
        {face(dots(4), `rotateY(-90deg) translateZ(${half}px)`, faceGrad)}
        {face(dots(5), `rotateX(90deg) translateZ(${half}px)`, faceGrad)}
        {face(dots(6), `rotateX(-90deg) translateZ(${half}px)`, faceGrad)}
      </div>
    </div>
  );
}
