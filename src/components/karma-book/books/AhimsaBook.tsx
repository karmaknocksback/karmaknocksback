"use client";
import { useState } from "react";
import { useBookMedia } from "../useBookMedia";
import BookPageMedia from "../BookPageMedia";

const PAGES = [
  {label:"📖 Cover",color:"#00BCD4"},
  {label:"🕊️ What is Ahimsa?",color:"#0097A7"},
  {label:"🐜 Every Creature Counts",color:"#00838F"},
  {label:"🌿 Ahimsa in Words",color:"#006064"},
  {label:"💭 Ahimsa in Thoughts",color:"#00BCD4"},
  {label:"🌱 Ahimsa in Food",color:"#00838F"},
  {label:"⭐ Ahimsa Heroes",color:"#0097A7"},
  {label:"🌟 Ahimsa Challenge",color:"#006064"},
];

function NavBtn({d,onClick,disabled,color,primary}:{d:React.ReactNode;onClick:()=>void;disabled:boolean;color:string;primary?:boolean}) {
  return <button onClick={onClick} disabled={disabled} style={{width:42,height:42,borderRadius:"50%",border:`2px solid ${primary?color:"rgba(255,255,255,0.2)"}`,background:primary?`${color}30`:"rgba(255,255,255,0.05)",color:primary?color:"rgba(255,255,255,0.7)",fontSize:20,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.25:1}}>{d}</button>;
}

function BL({left,right,lb="#0a1a1e",rb="#E0F7FA",rc="#006064",pageMedia}:{left:React.ReactNode;right:React.ReactNode;lb?:string;rb?:string;rc?:string;pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return (
    <div style={{display:"flex",minHeight:"min(480px,72vw)",maxHeight:520}}>
      <div style={{width:"50%",background:lb,overflow:"hidden",position:"relative"}}><BookPageMedia media={pageMedia} fallback={left}/></div>
      <div style={{width:"50%",background:rb,color:rc,padding:"22px 20px",display:"flex",flexDirection:"column",overflow:"hidden"}}>{right}</div>
    </div>
  );
}

export default function AhimsaBook() {
  const bookMedia = useBookMedia("ahimsa");
  const [cur,setCur]=useState(0);
  const comps=[AP0,AP1,AP2,AP3,AP4,AP5,AP6,AP7];
  const P=comps[cur]??AP0;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 16px"}}>
      <div style={{width:"min(680px,100%)",borderRadius:20,overflow:"hidden",boxShadow:`0 0 0 2px ${PAGES[cur].color}40,0 40px 80px rgba(0,0,0,0.7)`}}><P/></div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginTop:22}}>
        <NavBtn d="‹" onClick={()=>setCur(Math.max(0,cur-1))} disabled={cur===0} color={PAGES[cur].color}/>
        <div style={{display:"flex",gap:5}}>{PAGES.map((p,i)=><button key={i} onClick={()=>setCur(i)} style={{width:cur===i?20:8,height:8,borderRadius:99,background:cur===i?p.color:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",transition:"all 0.2s"}}/>)}</div>
        <NavBtn d="›" onClick={()=>setCur(Math.min(PAGES.length-1,cur+1))} disabled={cur===PAGES.length-1} color={PAGES[cur].color} primary/>
      </div>
      <p style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:8,fontFamily:"sans-serif"}}>{PAGES[cur].label} · {cur+1}/{PAGES.length}</p>
    </div>
  );
}

function AP0({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return <BL pageMedia={pageMedia} lb="#0a1a1e" rb="linear-gradient(160deg,#003344,#006064)" rc="#00BCD4" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      {[[30,30,2,"#00BCD4"],[200,20,1.5,"#fff"],[260,14,2,"#00E5FF"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.8}/>)}
      {/* Dove in center */}
      <ellipse cx="155" cy="200" r="70" fill="none" stroke="#00BCD4" strokeWidth="1" opacity="0.25"/>
      <ellipse cx="155" cy="200" r="50" fill="#00BCD4" opacity={0.12}/>
      {/* Dove body */}
      <ellipse cx="155" cy="210" rx="35" ry="22" fill="white" opacity={0.9}/>
      {/* Wings */}
      <path d="M120 205 Q90 175 100 155 Q115 160 125 200" fill="white" opacity={0.85}/>
      <path d="M190 205 Q220 175 210 155 Q195 160 185 200" fill="white" opacity={0.85}/>
      {/* Head */}
      <circle cx="185" cy="198" r="16" fill="white" opacity={0.95}/>
      <circle cx="190" cy="195" r="4" fill="#00BCD4"/>
      <circle cx="191" cy="194" r="1.5" fill="white"/>
      {/* Beak */}
      <path d="M198 198 L206 200 L198 202" fill="#FF9800"/>
      {/* Olive branch */}
      <path d="M130 225 Q140 235 155 230 Q170 225 180 235" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {[[138,228],[148,224],[158,226],[168,224],[176,229]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx={5} ry={3} fill="#66BB6A" transform={`rotate(${i*15-30} ${x} ${y})`}/>)}
      {/* Small creatures below */}
      {["🐜","🦋","🌸","🐝","🌿"].map((em,i)=><text key={i} x={42+i*56} y="380" textAnchor="middle" fontSize="22">{em}</text>)}
      <rect x="55" y="420" width="200" height="32" rx="14" fill="#00BCD4" opacity={0.9}/>
      <text x="155" y="440" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">🕊️ Ahimsa — The Superpower</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.3em",color:"#00BCD4",fontWeight:800,fontFamily:"sans-serif",marginBottom:12}}>BOOK 4 · AHIMSA</div>
      <div style={{fontSize:28,fontWeight:900,lineHeight:1.1,color:"#00BCD4",marginBottom:6,fontFamily:"sans-serif"}}>अहिंसा<br/>महाशक्ति! 🕊️</div>
      <div style={{fontSize:13,color:"#80DEEA",fontWeight:700,marginBottom:16,fontFamily:"sans-serif"}}>Ahimsa — The Greatest Superpower!</div>
      <div style={{fontSize:12,color:"#B2EBF2",lineHeight:1.8,fontFamily:"sans-serif",marginBottom:14}}>
        <strong style={{color:"#00BCD4"}}>Ahimsa</strong> is the <em>most important</em> teaching in Jain dharma. It means <strong>not hurting ANY living being</strong> — in action, words, or even thoughts!
        <br/><br/>
        Why is it a superpower? Because it takes MORE courage to be kind than to be cruel! 💪
      </div>
      <div style={{padding:"12px 14px",background:"rgba(0,188,212,0.15)",border:"1.5px solid rgba(0,188,212,0.35)",borderRadius:14,fontSize:12,color:"#80DEEA",fontFamily:"sans-serif",lineHeight:1.9}}>
        <strong style={{color:"#00BCD4"}}>In this book:</strong><br/>
        ✦ What is Ahimsa exactly?<br/>
        ✦ How to be kind to every creature<br/>
        ✦ Ahimsa in words and thoughts<br/>
        ✦ Your Ahimsa Challenge!
      </div>
      <div style={{marginTop:"auto",fontSize:11,color:"rgba(0,188,212,0.5)",fontFamily:"sans-serif"}}>Ages 5+ · 8 pages</div>
    </>
  }/>;
}

function AP1({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E0F7FA" rc="#006064" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#0097A7"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">WHAT IS AHIMSA?</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#80DEEA">अहिंसा क्या है?</text>
      {/* Scale showing Himsa vs Ahimsa */}
      <rect x="135" y="120" width="40" height="140" rx="4" fill="#546E7A"/>
      <rect x="148" y="118" width="14" height="8" rx="2" fill="#607D8B"/>
      {/* Left pan - Himsa (heavy dark) */}
      <line x1="155" y1="130" x2="80" y2="180" stroke="#546E7A" strokeWidth="2.5"/>
      <path d="M55 180 Q80 175 105 180 L100 230 Q80 240 60 230 Z" fill="#B71C1C" opacity={0.85}/>
      <text x="80" y="210" textAnchor="middle" fontSize="18">😤</text>
      <text x="80" y="228" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">Himsa</text>
      <text x="80" y="250" textAnchor="middle" fontSize="9" fill="#FFCDD2">Violence = heavy!</text>
      {/* Right pan - Ahimsa (light, floating up) */}
      <line x1="155" y1="130" x2="230" y2="150" stroke="#546E7A" strokeWidth="2.5"/>
      <path d="M205 150 Q230 145 255 150 L252 195 Q232 205 212 195 Z" fill="#00BCD4" opacity={0.85}/>
      <text x="230" y="175" textAnchor="middle" fontSize="18">🕊️</text>
      <text x="230" y="196" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">Ahimsa</text>
      <text x="230" y="218" textAnchor="middle" fontSize="9" fill="#B2EBF2">Kindness = light!</text>
      {/* Definition circle */}
      <circle cx="155" cy="360" r="52" fill="#0097A7" opacity={0.2}/>
      <circle cx="155" cy="360" r="40" fill="#0097A7" opacity={0.4}/>
      <circle cx="155" cy="360" r="28" fill="#00BCD4" opacity={0.9}/>
      <text x="155" y="353" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">न + हिंसा</text>
      <text x="155" y="367" textAnchor="middle" fontSize="9" fill="#E0F7FA">No Violence</text>
      <text x="155" y="380" textAnchor="middle" fontSize="8" fill="#B2EBF2">=  Ahimsa ✨</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#0097A7",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 2 · DEFINITION</div>
      <div style={{fontSize:19,fontWeight:900,color:"#006064",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>अहिंसा क्या है? 🕊️<br/><span style={{fontSize:13,fontWeight:600}}>What is Ahimsa exactly?</span></div>
      <div style={{fontSize:12,color:"#006064",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        <strong>Himsa (हिंसा)</strong> = hurting, harming, killing<br/>
        <strong>A-himsa (अ-हिंसा)</strong> = the opposite — NOT hurting!<br/><br/>
        Ahimsa means <em>not hurting any living being through your actions, your words, or your thoughts</em>. Even wishing someone harm is Himsa!
      </div>
      {[
        ["💪","It is NOT weakness — it takes great courage to be non-violent!"],
        ["🧠","Jain monks count the breaths they take to avoid hurting air beings!"],
        ["🪣","They filter water so tiny creatures aren't harmed!"],
        ["🚶","They walk carefully to avoid stepping on insects!"],
        ["😴","They don't sleep on the ground to protect tiny creatures!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#E0F7FA",border:"1px solid #80DEEA",color:"#006064",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{marginTop:8,padding:"8px 12px",background:"#0097A7",borderRadius:10,fontSize:12,color:"white",fontFamily:"sans-serif"}}>
        🕊️ <strong>&quot;Live and let live&quot;</strong> — this is the heart of Ahimsa. Every single creature wants to live, just like you!
      </div>
    </>
  }/>;
}

function AP2({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E0F7FA" rc="#006064" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#00838F"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">EVERY CREATURE HAS A SOUL!</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#80DEEA">हर जीव में आत्मा है!</text>
      {/* Big chart of creatures */}
      {[
        [60,130,"#FFD700","👤","Human","5-sensed"],
        [155,130,"#FF9800","🐘","Elephant","5-sensed"],
        [250,130,"#4CAF50","🐟","Fish","5-sensed"],
        [60,240,"#E91E63","🦋","Butterfly","5-sensed"],
        [155,240,"#9C27B0","🐜","Ant","6-sensed?" ],
        [250,240,"#2196F3","🌿","Plant","1-sensed"],
        [60,350,"#FF5722","🔥","Fire","1-sensed"],
        [155,350,"#00BCD4","💧","Water","1-sensed"],
        [250,350,"#607D8B","🌬️","Air","1-sensed"],
      ].map(([x,y,c,em,n,s],i)=>(
        <g key={i}>
          <circle cx={+x} cy={+y} r={32} fill={c as string} opacity={0.25}/>
          <circle cx={+x} cy={+y} r={22} fill={c as string} opacity={0.6}/>
          <text x={+x} y={(+y)-4} textAnchor="middle" fontSize="18">{em as string}</text>
          <text x={+x} y={(+y)+10} textAnchor="middle" fontSize="7" fill="white" fontWeight="900">{n as string}</text>
          <rect x={+x-20} y={(+y)+16} width={40} height={12} rx={4} fill={c as string} opacity={0.5}/>
          <text x={+x} y={(+y)+25} textAnchor="middle" fontSize="7" fill="white">{s as string}</text>
        </g>
      ))}
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#00838F",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 3 · ALL SOULS</div>
      <div style={{fontSize:18,fontWeight:900,color:"#006064",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>हर जीव में<br/>आत्मा है! 🌍<br/><span style={{fontSize:13,fontWeight:600}}>Every Creature Has a Soul!</span></div>
      <div style={{fontSize:12,color:"#006064",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Jain Shastras teach us that <strong>not just humans and animals</strong> — even plants, fire, water, and air have souls (Jivas) and the ability to feel pain!
        <br/><br/>
        Souls are classified by how many senses they have:
      </div>
      {[
        ["5+6","🐘🦁🐟","Humans, animals, birds, fish — 5 or 6 senses"],
        ["2-3-4","🐛🐜🐝","Worms, ants, bees — 2 to 4 senses"],
        ["1 sense","🌿🔥💧","Plants, fire, water, air, earth — 1 sense (touch)"],
      ].map(([n,em,d])=>(
        <div key={n as string} style={{fontSize:11,padding:"7px 10px",borderRadius:9,marginBottom:6,background:"#B2EBF2",border:"1px solid #80DEEA",color:"#006064",fontFamily:"sans-serif"}}>
          <strong>{n as string} senses:</strong> {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#006064",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif"}}>
        🐜 <strong>Even an ant feels pain!</strong> When Chintu accidentally stepped on an ant, he said sorry — because that ant has a soul just like him! 🙏
      </div>
      <div style={{marginTop:6,padding:"8px 12px",background:"rgba(0,188,212,0.15)",borderRadius:10,fontSize:11,color:"#006064",fontFamily:"sans-serif",border:"1px solid rgba(0,188,212,0.3)"}}>
        🌿 <strong>That&apos;s why</strong> Jain monks walk with a soft broom (rajoharana) to gently move insects off the path before each step!
      </div>
    </>
  }/>;
}

function AP3({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E0F7FA" rc="#006064" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#006064"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">AHIMSA IN WORDS</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#80DEEA">वाणी में अहिंसा</text>
      {/* Good words vs bad words */}
      <ellipse cx="82" cy="200" rx="62" ry="72" fill="#F44336" opacity={0.2}/>
      <ellipse cx="82" cy="200" rx="50" ry="58" fill="#F44336" opacity={0.3}/>
      <text x="82" y="150" textAnchor="middle" fontSize="22">😠</text>
      <text x="82" y="175" textAnchor="middle" fontSize="11" fill="#EF9A9A" fontWeight="900">Himsa Words</text>
      {["You are stupid!","I hate you!","Ugly!","Loser!"].map((w,i)=>(
        <text key={i} x="82" y={196+i*20} textAnchor="middle" fontSize="9" fill="#FFCDD2">{w}</text>
      ))}
      {/* Divider */}
      <line x1="155" y1="80" x2="155" y2="420" stroke="#00BCD4" strokeWidth="1" strokeDasharray="6,4" opacity="0.5"/>
      <text x="155" y="200" textAnchor="middle" fontSize="18" fill="#00BCD4">VS</text>
      <ellipse cx="228" cy="200" rx="62" ry="72" fill="#00BCD4" opacity={0.2}/>
      <ellipse cx="228" cy="200" rx="50" ry="58" fill="#00BCD4" opacity={0.3}/>
      <text x="228" y="150" textAnchor="middle" fontSize="22">😊</text>
      <text x="228" y="175" textAnchor="middle" fontSize="11" fill="#80DEEA" fontWeight="900">Ahimsa Words</text>
      {["You can do it!","I care for you!","Great try!","Well done!"].map((w,i)=>(
        <text key={i} x="228" y={196+i*20} textAnchor="middle" fontSize="9" fill="#B2EBF2">{w}</text>
      ))}
      {/* Chintu choosing */}
      <circle cx="155" cy="380" r="18" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
      <text x="155" y="386" textAnchor="middle" fontSize="12">🤔</text>
      <text x="155" y="415" textAnchor="middle" fontSize="9" fill="#00BCD4" fontWeight="700">Chintu chooses kind words!</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#006064",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 4 · WORDS</div>
      <div style={{fontSize:18,fontWeight:900,color:"#006064",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>वाणी में अहिंसा! 🗣️<br/><span style={{fontSize:13,fontWeight:600}}>Ahimsa in Your Words</span></div>
      <div style={{fontSize:12,color:"#006064",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Words can hurt MORE than a punch! A bruise heals in days, but cruel words can hurt someone for years.<br/><br/>
        Jain Shastras say: <strong>&quot;Speak only what is true, kind, necessary, and helpful.&quot;</strong>
      </div>
      {[
        ["✅","Speak gently — even when you're angry"],
        ["✅","Use words that encourage, not discourage"],
        ["✅","Never call anyone names or mock them"],
        ["✅","If you've said something hurtful, apologize sincerely"],
        ["✅","Silence is better than harsh words!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#E0F7FA",border:"1px solid #80DEEA",color:"#006064",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#00838F",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif",marginTop:6}}>
        💬 <strong>Priya&apos;s lesson:</strong> She used to call her brother &quot;stupid&quot; when angry. She learned this is Himsa! Now she says &quot;I&apos;m upset right now&quot; instead. Her relationship became so much better! 💙
      </div>
    </>
  }/>;
}

function AP4({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E0F7FA" rc="#006064" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#0097A7"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">AHIMSA IN THOUGHTS</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#80DEEA">मन में अहिंसा</text>
      {/* Brain with thoughts */}
      <ellipse cx="155" cy="200" rx="70" ry="62" fill="#0097A7" opacity={0.25}/>
      <ellipse cx="155" cy="200" rx="55" ry="48" fill="#0097A7" opacity={0.4}/>
      {/* Bad thought bubble left */}
      <ellipse cx="65" cy="130" rx="45" ry="30" fill="#F44336" opacity={0.8}/>
      <text x="65" y="125" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">I wish</text>
      <text x="65" y="138" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">them harm! 😤</text>
      <circle cx="85" cy="162" r="5" fill="#F44336" opacity={0.6}/>
      <circle cx="100" cy="175" r="4" fill="#F44336" opacity={0.5}/>
      {/* Good thought bubble right */}
      <ellipse cx="248" cy="130" rx="45" ry="30" fill="#4CAF50" opacity={0.8}/>
      <text x="248" y="125" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">I wish</text>
      <text x="248" y="138" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">them well! 🕊️</text>
      <circle cx="228" cy="162" r="5" fill="#4CAF50" opacity={0.6}/>
      <circle cx="215" cy="175" r="4" fill="#4CAF50" opacity={0.5}/>
      {/* Heart in brain center */}
      <text x="155" y="210" textAnchor="middle" fontSize="30">💙</text>
      <text x="155" y="232" textAnchor="middle" fontSize="9" fill="white" fontWeight="800">Pure Heart</text>
      {/* Meditation figure */}
      <circle cx="155" cy="350" r="26" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
      <text x="155" y="342" textAnchor="middle" fontSize="14">😌</text>
      <text x="155" y="358" textAnchor="middle" fontSize="10">🧘</text>
      <text x="155" y="395" textAnchor="middle" fontSize="9" fill="#00BCD4">Meditation = Clean Thoughts!</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#0097A7",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 5 · THOUGHTS</div>
      <div style={{fontSize:18,fontWeight:900,color:"#006064",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>मन में अहिंसा! 💭<br/><span style={{fontSize:13,fontWeight:600}}>Ahimsa in Your Thoughts</span></div>
      <div style={{fontSize:12,color:"#006064",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Even thinking of hurting someone creates <strong>karma</strong>! Jain Shastras say that thought-violence (Manasa Himsa) is the most powerful type of Himsa because <em>all actions start in the mind!</em>
      </div>
      {[
        ["😤","Wishing someone would fail = Himsa karma!"],
        ["💚","Wishing everyone happiness = Ahimsa merit!"],
        ["🧘","Daily meditation cleans bad thoughts naturally"],
        ["💭","When a bad thought comes — don't act on it. Let it pass like a cloud"],
        ["🌸","Practice Maitri (friendship) for all living beings"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#E0F7FA",border:"1px solid #80DEEA",color:"#006064",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#0097A7",borderRadius:10,fontSize:12,color:"white",fontFamily:"sans-serif",marginTop:6}}>
        🌟 <strong>Maitri Bhavana:</strong> Say every morning — &quot;May all living beings be happy. May all be free from suffering.&quot; This cleans the mind instantly! 💙
      </div>
    </>
  }/>;
}

function AP5({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E8F5E9" rc="#1B5E20" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#2E7D32"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">AHIMSA IN FOOD</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#A5D6A7">आहार में अहिंसा</text>
      {/* Two plates comparison */}
      {/* Veg plate right */}
      <circle cx="228" cy="215" r="65" fill="#4CAF50" opacity={0.2} stroke="#4CAF50" strokeWidth="2"/>
      <circle cx="228" cy="215" r="52" fill="#4CAF50" opacity={0.15}/>
      {["🥕","🥦","🍎","🌽","🍞"].map((em,i)=>{
        const a=((i/5)*2*Math.PI)-Math.PI/2;
        return <text key={i} x={228+32*Math.cos(a)} y={218+32*Math.sin(a)} textAnchor="middle" fontSize="20">{em}</text>;
      })}
      <text x="228" y="215" textAnchor="middle" fontSize="14">🌿</text>
      <text x="228" y="290" textAnchor="middle" fontSize="10" fill="#4CAF50" fontWeight="900">✓ Satvik Food</text>
      <text x="228" y="305" textAnchor="middle" fontSize="9" fill="#81C784">Minimum Himsa</text>
      {/* Non-veg plate left with X */}
      <circle cx="82" cy="215" r="65" fill="#F44336" opacity={0.15} stroke="#F44336" strokeWidth="2"/>
      <text x="82" y="215" textAnchor="middle" fontSize="40">🥩</text>
      <text x="82" y="250" textAnchor="middle" fontSize="28" fill="#F44336">✗</text>
      <text x="82" y="290" textAnchor="middle" fontSize="10" fill="#EF9A9A" fontWeight="900">✗ Non-Veg</text>
      <text x="82" y="305" textAnchor="middle" fontSize="9" fill="#FFCDD2">Requires killing</text>
      {/* Chintu choosing veg */}
      <circle cx="155" cy="390" r="20" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
      <text x="155" y="395" textAnchor="middle" fontSize="12">😊</text>
      <path d="M160 375 L228 300" stroke="#4CAF50" strokeWidth="2" strokeDasharray="4,2"/>
      <text x="155" y="430" textAnchor="middle" fontSize="9" fill="#4CAF50">Chintu always chooses veg! 🌿</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#2E7D32",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 6 · FOOD</div>
      <div style={{fontSize:18,fontWeight:900,color:"#1B5E20",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>आहार में अहिंसा! 🥗<br/><span style={{fontSize:13,fontWeight:600}}>Ahimsa in What We Eat</span></div>
      <div style={{fontSize:12,color:"#2E7D32",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Every food choice affects living beings. Jains choose food that causes the <strong>minimum possible harm</strong>!
      </div>
      {[
        ["✅","Pure vegetarian food — no meat, fish, or eggs ever!"],
        ["✅","Avoid root vegetables (potato, onion, garlic) — pulling roots kills the whole plant with infinite souls!"],
        ["✅","Eat before sunset — insects come out at night!"],
        ["✅","Don't waste food — every grain of food had a life!"],
        ["🧘","Monks eat only once a day, standing — maximum Ahimsa!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#E8F5E9",border:"1px solid #A5D6A7",color:"#1B5E20",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#2E7D32",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif",marginTop:6}}>
        🌱 <strong>Remember:</strong> Being vegetarian isn&apos;t just about food — it&apos;s a statement that you value every life as much as your own! 💚
      </div>
    </>
  }/>;
}

function AP6({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  const heroes=[
    {n:"महावीर स्वामी",e:"Lord Mahavir",d:"Walked barefoot. Never harmed any creature.",em:"🦚",c:"#FF9800"},
    {n:"गाँधीजी",e:"Mahatma Gandhi",d:"Used Ahimsa to free India from British rule!",em:"🕊️",c:"#4CAF50"},
    {n:"Albert Einstein",e:"Albert Einstein",d:"Said Jain Ahimsa is the most evolved ethics!",em:"🔬",c:"#2196F3"},
    {n:"Priya",e:"Priya (Our hero!)",d:"Said sorry to every creature she ever hurt!",em:"👧",c:"#E91E63"},
  ];
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E0F7FA" rc="#006064" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#0097A7"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">AHIMSA HEROES!</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#80DEEA">अहिंसा के वीर</text>
      {heroes.map((h,i)=>(
        <g key={i}>
          <rect x="15" y={90+i*90} width="280" height="75" rx="14" fill={h.c} opacity={0.18}/>
          <rect x="15" y={90+i*90} width="280" height="75" rx="14" fill="none" stroke={h.c} strokeWidth="1.5" opacity={0.5}/>
          <circle cx="55" cy={127+i*90} r="26" fill={h.c} opacity={0.7}/>
          <text x="55" y={133+i*90} textAnchor="middle" fontSize="22">{h.em}</text>
          <text x="100" y={112+i*90} fontSize="11" fill={h.c} fontWeight="900">{h.n}</text>
          <text x="100" y={126+i*90} fontSize="9" fill="rgba(255,255,255,0.7)">{h.e}</text>
          <text x="100" y={140+i*90} fontSize="9" fill="rgba(255,255,255,0.55)" textDecoration="none">{h.d}</text>
        </g>
      ))}
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#0097A7",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 7 · HEROES</div>
      <div style={{fontSize:18,fontWeight:900,color:"#006064",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>अहिंसा के वीर! ⭐<br/><span style={{fontSize:13,fontWeight:600}}>Ahimsa Heroes of History</span></div>
      <div style={{fontSize:12,color:"#006064",lineHeight:1.7,marginBottom:10,fontFamily:"sans-serif"}}>
        Throughout history, the bravest people chose <em>kindness over violence</em>. These heroes proved that Ahimsa is the most powerful force in the universe!
      </div>
      {heroes.map(h=>(
        <div key={h.n} style={{fontSize:11,padding:"7px 10px",borderRadius:9,marginBottom:6,background:`${h.c}20`,border:`1.5px solid ${h.c}50`,color:"#006064",fontFamily:"sans-serif"}}>
          <strong style={{color:h.c}}>{h.em} {h.e}</strong><br/>
          {h.d}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#006064",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif",marginTop:6}}>
        🌟 <strong>YOU can be an Ahimsa Hero too!</strong> Every day you choose kindness, you join this amazing group of brave souls!
      </div>
    </>
  }/>;
}

function AP7({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  const challenges=[
    "🌿 Eat 100% vegetarian today",
    "🐜 Move an insect to safety instead of killing it",
    "💬 Say only kind words all day",
    "🧘 Think 'May everyone be happy' in the morning",
    "🙏 Apologize to anyone you have hurt",
    "🌊 Don't waste water or food today",
    "😊 Smile at everyone — even strangers!",
    "🕊️ Do one act of kindness for an animal",
  ];
  return <BL pageMedia={pageMedia} lb="#001a22" rb="#E0F7FA" rc="#006064" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#001a22"/>
      <rect width="310" height="52" fill="#006064"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">YOUR AHIMSA CHALLENGE!</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#80DEEA">तुम्हारी अहिंसा चुनौती!</text>
      {/* Trophy */}
      <text x="155" y="150" textAnchor="middle" fontSize="60">🏆</text>
      <text x="155" y="192" textAnchor="middle" fontSize="14" fill="#FFD700" fontWeight="900">Ahimsa Champion!</text>
      {/* Star badge */}
      {[60,100,140,180,220].map((a,i)=>(
        <text key={i} x={155+80*Math.cos(a*Math.PI/180)} y={280+60*Math.sin(a*Math.PI/180)} textAnchor="middle" fontSize="22">⭐</text>
      ))}
      <circle cx="155" cy="290" r="38" fill="#00BCD4" opacity={0.3}/>
      <circle cx="155" cy="290" r="26" fill="#00BCD4" opacity={0.6}/>
      <text x="155" y="284" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">I AM AN</text>
      <text x="155" y="298" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">AHIMSA HERO!</text>
      <text x="155" y="400" textAnchor="middle" fontSize="10" fill="#00BCD4" fontWeight="700">🕊️ जीव और जीने दो 🕊️</text>
      <text x="155" y="420" textAnchor="middle" fontSize="9" fill="#80DEEA">Live and Let Live!</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#006064",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>FINAL PAGE · CHALLENGE</div>
      <div style={{fontSize:18,fontWeight:900,color:"#006064",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>तुम्हारी अहिंसा<br/>चुनौती! 🏆<br/><span style={{fontSize:13,fontWeight:600}}>Your Daily Ahimsa Challenge</span></div>
      <div style={{fontSize:12,color:"#006064",lineHeight:1.6,marginBottom:8,fontFamily:"sans-serif"}}>
        Can you do all 8 Ahimsa challenges today? Check them off and become an <strong>Ahimsa Champion!</strong>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {challenges.map(c=>(
          <div key={c} style={{fontSize:10.5,padding:"4px 9px",borderRadius:8,background:"#B2EBF2",color:"#006064",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:16,height:16,borderRadius:4,border:"1.5px solid #0097A7",display:"inline-block",flexShrink:0}}/>
            {c}
          </div>
        ))}
      </div>
      <div style={{marginTop:8,padding:"8px 12px",background:"#0097A7",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif",textAlign:"center"}}>
        🌟 <strong>Every kind action you take today</strong><br/>makes your soul a little brighter! ✨
      </div>
    </>
  }/>;
}
