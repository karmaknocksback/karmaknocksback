"use client";
import { useState } from "react";

const PAGES = [
  {label:"📖 Cover",color:"#FF9800"},
  {label:"🕉️ Who are Tirthankaras?",color:"#E65100"},
  {label:"👑 Adinath — 1st",color:"#FF8F00"},
  {label:"🦁 Neminath — 22nd",color:"#EF6C00"},
  {label:"🐚 Parshvanath — 23rd",color:"#BF360C"},
  {label:"🦚 Mahavir — 24th",color:"#FF5722"},
  {label:"⭐ 5 Special Powers",color:"#FF9800"},
  {label:"🙏 Bow to All 24",color:"#E65100"},
];

const TIRTHS = [
  {n:"ऋषभनाथ",e:"Adinath",num:"1st",sym:"Bull 🐂",color:"#FFD54F",em:"👑"},
  {n:"चंद्रप्रभु",e:"Chandraprabhu",num:"8th",sym:"Moon 🌙",color:"#B3E5FC",em:"🌙"},
  {n:"शीतलनाथ",e:"Sheetalnath",num:"10th",sym:"Srivatsa ✨",color:"#C8E6C9",em:"❄️"},
  {n:"नेमीनाथ",e:"Neminath",num:"22nd",sym:"Conch 🐚",color:"#E1BEE7",em:"🐚"},
  {n:"पार्श्वनाथ",e:"Parshvanath",num:"23rd",sym:"Snake 🐍",color:"#B2DFDB",em:"🐍"},
  {n:"महावीर",e:"Mahavir",num:"24th",sym:"Lion 🦁",color:"#FFE082",em:"🦚"},
];

export default function TirthankarBook() {
  const [cur, setCur] = useState(0);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 16px"}}>
      <div style={{width:"min(680px,100%)",borderRadius:20,overflow:"hidden",boxShadow:`0 0 0 2px ${PAGES[cur].color}40, 0 40px 80px rgba(0,0,0,0.7)`}}>
        <TPage cur={cur}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginTop:22}}>
        <button onClick={()=>setCur(Math.max(0,cur-1))} disabled={cur===0} style={{width:40,height:40,borderRadius:"50%",border:`2px solid rgba(255,255,255,0.2)`,background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)",fontSize:18,cursor:cur===0?"not-allowed":"pointer",opacity:cur===0?0.25:1}}>‹</button>
        <div style={{display:"flex",gap:5}}>{PAGES.map((p,i)=><button key={i} onClick={()=>setCur(i)} style={{width:cur===i?20:8,height:8,borderRadius:99,background:cur===i?p.color:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",transition:"all 0.2s"}}/>)}</div>
        <button onClick={()=>setCur(Math.min(PAGES.length-1,cur+1))} disabled={cur===PAGES.length-1} style={{width:40,height:40,borderRadius:"50%",border:`2px solid ${PAGES[cur].color}`,background:`${PAGES[cur].color}25`,color:PAGES[cur].color,fontSize:18,cursor:cur===PAGES.length-1?"not-allowed":"pointer",opacity:cur===PAGES.length-1?0.25:1}}>›</button>
      </div>
      <p style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:8,fontFamily:"sans-serif"}}>{PAGES[cur].label} · {cur+1}/{PAGES.length}</p>
    </div>
  );
}

function TPage({cur}:{cur:number}) {
  const pages = [TP0,TP1,TP2,TP3,TP4,TP5,TP6,TP7];
  const P = pages[cur] ?? TP0;
  return <P/>;
}

function BL({left,right,lb="#1a0800",rb="#FFF3E0",rc="#4E342E"}:{left:React.ReactNode;right:React.ReactNode;lb?:string;rb?:string;rc?:string}) {
  return (
    <div style={{display:"flex",minHeight:"min(480px,72vw)",maxHeight:520}}>
      <div style={{width:"50%",background:lb,overflow:"hidden",position:"relative"}}>{left}</div>
      <div style={{width:"50%",background:rb,color:rc,padding:"22px 20px",display:"flex",flexDirection:"column",overflow:"hidden"}}>{right}</div>
    </div>
  );
}

function TP0() {
  return <BL lb="#1a0800" rb="linear-gradient(160deg,#1a0800,#3d1a00)" rc="#FF9800" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#100600"/>
      {[[30,30,2,"#FF9800"],[200,20,1.5,"#fff"],[260,14,2,"#FFD700"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.9}/>)}
      {/* 24 small circles = 24 tirthankaras */}
      {Array.from({length:24},(_,i)=>{
        const a = (i/24)*2*Math.PI - Math.PI/2;
        return <circle key={i} cx={155+90*Math.cos(a)} cy={220+90*Math.sin(a)} r={6} fill="#FF9800" opacity={0.7+(i%3)*0.1}/>;
      })}
      <circle cx="155" cy="220" r="52" fill="#FF9800" opacity={0.2}/>
      <circle cx="155" cy="220" r="38" fill="#FF9800" opacity={0.4}/>
      <circle cx="155" cy="220" r="26" fill="#FF8F00"/>
      <text x="155" y="214" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">24</text>
      <text x="155" y="230" textAnchor="middle" fontSize="9" fill="#FFE082">तीर्थंकर</text>
      <text x="155" y="395" textAnchor="middle" fontSize="10" fill="#FF9800">24 Tirthankaras of this cycle</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.3em",color:"#FF9800",fontWeight:800,fontFamily:"sans-serif",marginBottom:12}}>BOOK 3 · 24 TIRTHANKARAS</div>
      <div style={{fontSize:26,fontWeight:900,lineHeight:1.1,color:"#FF9800",marginBottom:8,fontFamily:"sans-serif"}}>24<br/>तीर्थंकर ✨</div>
      <div style={{fontSize:13,color:"#FFB74D",fontWeight:700,marginBottom:14,fontFamily:"sans-serif"}}>The 24 Divine Guides!</div>
      <div style={{fontSize:12,color:"#FFE0B2",lineHeight:1.7,fontFamily:"sans-serif",marginBottom:14}}>
        In every time cycle, exactly <strong style={{color:"#FF9800"}}>24 great souls</strong> achieve perfect liberation and teach the path to others. They are called <em>Tirthankaras</em>!<br/><br/>
        Right now we are in the time of our 24th Tirthankar — <strong>Lord Mahavir!</strong>
      </div>
      <div style={{padding:"12px 14px",background:"rgba(255,152,0,0.15)",border:"1.5px solid rgba(255,152,0,0.35)",borderRadius:14}}>
        <div style={{fontSize:12,color:"#FFD700",lineHeight:1.9,fontFamily:"sans-serif"}}>
          <strong>Each Tirthankar has:</strong><br/>
          ✦ A special symbol (like lion, lotus)<br/>
          ✦ A special tree (the tree under which they got Kevalgyan)<br/>
          ✦ A special colour<br/>
          ✦ An attendant (Yaksha/Yakshini)
        </div>
      </div>
      <div style={{marginTop:"auto",fontSize:11,color:"rgba(255,152,0,0.5)",fontFamily:"sans-serif"}}>Ages 6+ · 8 pages · Digambara Jain</div>
    </>
  }/>;
}

function TP1() {
  return <BL lb="#100a00" rb="#FFF8E1" rc="#4E342E" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#100a00"/>
      <rect width="310" height="52" fill="#E65100"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">WHO IS A TIRTHANKAR?</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFD700">तीर्थंकर कौन होते हैं?</text>
      {/* Journey visual: soul → effort → kevalgyan → teaching → moksha */}
      {[["Soul",70,140,"#FFD700","🌟"],["Tapas",155,140,"#FF9800","🔥"],["Kevalgyan",240,140,"#FFEB3B","⚡"],["Teach",155,270,"#4CAF50","🎓"],["Moksha",155,380,"#FFD700","✨"]].map(([n,x,y,c,em])=>(
        <g key={n as string}>
          <circle cx={+x} cy={+y} r={32} fill={c as string} opacity={0.25}/>
          <circle cx={+x} cy={+y} r={22} fill={c as string} opacity={0.7}/>
          <text x={+x} y={+y-4} textAnchor="middle" fontSize="14">{em as string}</text>
          <text x={+x} y={+y+10} textAnchor="middle" fontSize="8" fill="#100a00" fontWeight="900">{n as string}</text>
        </g>
      ))}
      <line x1="92" y1="140" x2="123" y2="140" stroke="#FF9800" strokeWidth="2" strokeDasharray="4,2"/>
      <line x1="177" y1="140" x2="208" y2="140" stroke="#FF9800" strokeWidth="2" strokeDasharray="4,2"/>
      <line x1="240" y1="162" x2="175" y2="248" stroke="#4CAF50" strokeWidth="2" strokeDasharray="4,2"/>
      <line x1="155" y1="292" x2="155" y2="358" stroke="#FFD700" strokeWidth="2" strokeDasharray="4,2"/>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#E65100",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 2 · WHO ARE TIRTHANKARAS?</div>
      <div style={{fontSize:19,fontWeight:900,color:"#E65100",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>तीर्थंकर कौन होते हैं?<br/><span style={{fontSize:13,fontWeight:600}}>Who is a Tirthankar?</span></div>
      <div style={{fontSize:12,color:"#4E342E",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        A <strong>Tirthankar</strong> is a special soul who:
      </div>
      {[
        ["🌟","Had the Tirthankar-naam-karma — a special karma to become a guide"],
        ["🔥","Did intense Tapas for many many lifetimes"],
        ["⚡","Got Kevalgyan — infinite knowledge (knows everything!)"],
        ["🎓","Taught the path of liberation to millions of souls"],
        ["✨","Finally achieved Moksha — perfect and free forever!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#FFF3E0",border:"1px solid #FFB74D",color:"#4E342E",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{marginTop:8,padding:"8px 12px",background:"#FF9800",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif"}}>
        🌍 Tirthankar = &quot;One who builds the ford&quot; — they create the crossing point from samsara to Moksha!
      </div>
    </>
  }/>;
}

function TP2() {
  return <BL lb="#1a1200" rb="#FFF9C4" rc="#4E342E" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#1a1200"/>
      <rect width="310" height="52" fill="#F57F17"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">1st TIRTHANKAR — ADINATH / RISHABHDEV</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFD700">आदिनाथ — ऋषभदेव</text>
      {/* Majestic figure */}
      <ellipse cx="155" cy="185" rx="55" ry="55" fill="#FFD700" opacity={0.2}/>
      <circle cx="155" cy="160" r="38" fill="#FFCC80" stroke="#FF8F00" strokeWidth="3"/>
      {/* Crown / jata */}
      <path d="M 128 138 Q 135 115 155 112 Q 175 115 182 138" fill="#FFD700" stroke="#FF8F00" strokeWidth="2"/>
      <path d="M 135 130 Q 142 110 155 108 Q 168 110 175 130" fill="#FF8F00"/>
      {/* serene face */}
      <ellipse cx="146" cy="158" rx="6" ry="7" fill="white" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="164" cy="158" rx="6" ry="7" fill="white" stroke="#333" strokeWidth="1.5"/>
      <circle cx="146" cy="158" r="3.5" fill="#1A237E"/><circle cx="164" cy="158" r="3.5" fill="#1A237E"/>
      <path d="M143 172 Q155 180 167 172" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Third eye */}
      <ellipse cx="155" cy="148" rx="5" ry="3" fill="#FFD700" stroke="#FF8F00" strokeWidth="1"/>
      {/* Body in lotus */}
      <ellipse cx="155" cy="270" rx="45" ry="55" fill="#F57F17" opacity={0.7} stroke="#E65100" strokeWidth="2"/>
      <path d="M 110 290 Q 155 265 200 290" fill="#FFD700" opacity={0.6}/>
      {/* Bull symbol below */}
      <text x="155" y="380" textAnchor="middle" fontSize="36">🐂</text>
      <text x="155" y="410" textAnchor="middle" fontSize="10" fill="#FFD700">Symbol: Bull</text>
      <text x="155" y="428" textAnchor="middle" fontSize="9" fill="#FFB74D">Color: Golden Yellow</text>
      <text x="155" y="446" textAnchor="middle" fontSize="9" fill="#FFB74D">Yaksha: Gomukha</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#F57F17",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>1st TIRTHANKAR</div>
      <div style={{fontSize:18,fontWeight:900,color:"#E65100",lineHeight:1.2,marginBottom:4,fontFamily:"sans-serif"}}>ऋषभनाथ / आदिनाथ 👑</div>
      <div style={{fontSize:12,color:"#F57F17",fontWeight:700,marginBottom:10,fontFamily:"sans-serif"}}>The Very First Tirthankar!</div>
      <div style={{fontSize:12,color:"#4E342E",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        <strong>Adinath</strong> was the very first Tirthankar of this time cycle! He is also called <em>Rishabhdev</em> and is mentioned in Hindu scriptures too!
        <br/><br/>
        He taught humans how to <strong>farm, cook, write, and live in society</strong> — all the basics of civilization!
      </div>
      {[
        ["👑","Father of Bharat (from whom India is named Bharatvarsha!)"],
        ["🐂","Symbol: Bull — strength and service"],
        ["🌳","Tree: Banyan tree"],
        ["📅","Achieved Moksha on: Mount Ashtapad (Kailash)"],
        ["🎨","Colour: Golden Yellow"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:10.5,padding:"4px 9px",borderRadius:8,marginBottom:4,background:"#FFF3E0",color:"#4E342E",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{marginTop:8,padding:"8px 12px",background:"#FF8F00",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif"}}>
        🌟 <strong>Fun fact:</strong> Adinath lived for <strong>8.4 million years!</strong> Imagine that!
      </div>
    </>
  }/>;
}

function TP3() {
  return <BL lb="#0d1a0d" rb="#E8F5E9" rc="#1B5E20" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#0d1a0d"/>
      <rect width="310" height="52" fill="#2E7D32"/>
      <text x="155" y="26" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">22nd TIRTHANKAR — NEMINATH</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#A5D6A7">नेमिनाथ — श्रीकृष्ण के चचेरे भाई!</text>
      {/* Neminath figure with conch */}
      <ellipse cx="155" cy="180" rx="50" ry="50" fill="#4CAF50" opacity={0.2}/>
      <circle cx="155" cy="158" r="36" fill="#FFCC80" stroke="#388E3C" strokeWidth="3"/>
      <ellipse cx="146" cy="155" rx="5.5" ry="6.5" fill="white" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="164" cy="155" rx="5.5" ry="6.5" fill="white" stroke="#333" strokeWidth="1.5"/>
      <circle cx="146" cy="155" r="3.5" fill="#1B5E20"/><circle cx="164" cy="155" r="3.5" fill="#1B5E20"/>
      <path d="M143 168 Q155 176 167 168" stroke="#388E3C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="155" cy="265" rx="40" ry="50" fill="#2E7D32" opacity={0.8} stroke="#1B5E20" strokeWidth="2"/>
      <text x="155" y="360" textAnchor="middle" fontSize="32">🐚</text>
      <text x="155" y="395" textAnchor="middle" fontSize="10" fill="#4CAF50">Symbol: Conch Shell</text>
      <text x="155" y="413" textAnchor="middle" fontSize="9" fill="#81C784">Cousin of Lord Krishna!</text>
      {/* Animals saved */}
      {["🐄","🐏","🐐","🦌"].map((em,i)=><text key={i} x={50+i*60} y="450" textAnchor="middle" fontSize="20">{em}</text>)}
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#388E3C",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>22nd TIRTHANKAR</div>
      <div style={{fontSize:18,fontWeight:900,color:"#1B5E20",lineHeight:1.2,marginBottom:4,fontFamily:"sans-serif"}}>नेमिनाथ 🐚<br/><span style={{fontSize:13,fontWeight:600}}>The Compassionate One!</span></div>
      <div style={{fontSize:12,color:"#2E7D32",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Neminath was the <strong>cousin of Lord Krishna</strong>! He was about to get married when he heard the cries of animals being slaughtered for the wedding feast.
        <br/><br/>
        He immediately turned back his wedding chariot and <strong>became a monk</strong> to free all souls from suffering!
      </div>
      {[
        ["🐚","Symbol: Conch — purity and freedom"],
        ["💙","Colour: Dark Blue"],
        ["🌳","Tree: Vetasa (Mesua)"],
        ["🏔️","Moksha at: Mount Girnar, Gujarat"],
        ["👑","Cousin of: Lord Krishna (Shri Krishna)"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:10.5,padding:"4px 9px",borderRadius:8,marginBottom:4,background:"#E8F5E9",border:"1px solid #A5D6A7",color:"#1B5E20",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{marginTop:8,padding:"8px 12px",background:"#2E7D32",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif"}}>
        💚 <strong>Chintu&apos;s lesson:</strong> Neminath gave up a princess and a kingdom to save animals. That is true Ahimsa! 🐄
      </div>
    </>
  }/>;
}

function TP4() {
  return <BL lb="#0a1a16" rb="#E0F2F1" rc="#00695C" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#0a1a16"/>
      <rect width="310" height="52" fill="#00897B"/>
      <text x="155" y="26" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">23rd TIRTHANKAR — PARSHVANATH</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#A7FFEB">पार्श्वनाथ — नागेश्वर के साथ!</text>
      {/* Parshvanath with 7-headed serpent */}
      <circle cx="155" cy="155" r="36" fill="#FFCC80" stroke="#00897B" strokeWidth="3"/>
      <ellipse cx="146" cy="152" rx="5.5" ry="6.5" fill="white" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="164" cy="152" rx="5.5" ry="6.5" fill="white" stroke="#333" strokeWidth="1.5"/>
      <circle cx="146" cy="152" r="3.5" fill="#004D40"/><circle cx="164" cy="152" r="3.5" fill="#004D40"/>
      <path d="M143 166 Q155 174 167 166" stroke="#00695C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 7-headed serpent hood above */}
      {[-3,-2,-1,0,1,2,3].map((offset,i)=>(
        <ellipse key={i} cx={155+offset*14} cy={105} rx={10} ry={14} fill="#00897B" opacity={0.7+(i===3?0.3:0)} stroke="#004D40" strokeWidth="1.5" transform={`rotate(${offset*6} ${155+offset*14} 105)`}/>
      ))}
      {/* serpent body */}
      <path d="M 155 119 Q 155 190 155 245" stroke="#00897B" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.7"/>
      <ellipse cx="155" cy="265" rx="38" ry="48" fill="#00695C" opacity={0.8} stroke="#004D40" strokeWidth="2"/>
      <text x="155" y="360" textAnchor="middle" fontSize="32">🐍</text>
      <text x="155" y="390" textAnchor="middle" fontSize="10" fill="#00BFA5">Symbol: Snake / Serpent</text>
      <text x="155" y="410" textAnchor="middle" fontSize="9" fill="#80CBC4">Color: Green-Blue</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#00897B",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>23rd TIRTHANKAR</div>
      <div style={{fontSize:18,fontWeight:900,color:"#00695C",lineHeight:1.2,marginBottom:4,fontFamily:"sans-serif"}}>पार्श्वनाथ 🐍<br/><span style={{fontSize:13,fontWeight:600}}>The Protector!</span></div>
      <div style={{fontSize:12,color:"#00695C",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Parshvanath lived <strong>250 years before Lord Mahavir</strong>! He was the 23rd Tirthankar and saved a snake couple from a burning log — later they protected him during meditation!
        <br/><br/>
        He is shown with a <strong>7-headed serpent hood</strong> protecting him! 🐍
      </div>
      {[
        ["🐍","Symbol: Snake — he protected snakes!"],
        ["🔵","Colour: Blue-Green"],
        ["🌳","Tree: Dhaava"],
        ["🏙️","Born in: Varanasi (Benares)"],
        ["⏰","Lived: 100 years before Moksha"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:10.5,padding:"4px 9px",borderRadius:8,marginBottom:4,background:"#E0F2F1",border:"1px solid #80CBC4",color:"#00695C",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{marginTop:8,padding:"8px 12px",background:"#00695C",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif"}}>
        🐍 <strong>Amazing story:</strong> The snake Parshvanath saved in one life became the serpent Dharanendra who protected him from a storm during meditation! Karma always comes back! ✨
      </div>
    </>
  }/>;
}

function TP5() {
  return <BL lb="#1a0e00" rb="#FFF8E1" rc="#4E342E" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#1a0e00"/>
      <rect width="310" height="52" fill="#F57F17"/>
      <text x="155" y="26" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">24th TIRTHANKAR — LORD MAHAVIR</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFD700">वर्धमान महावीर — हमारे युग के तीर्थंकर!</text>
      {/* Mahavir - majestic figure with lion */}
      <ellipse cx="155" cy="175" rx="60" ry="60" fill="#FFD700" opacity={0.15}/>
      <circle cx="155" cy="150" r="42" fill="#FFCC80" stroke="#FF8F00" strokeWidth="3.5"/>
      {/* Jata/hair */}
      <path d="M 118 132 Q 125 108 155 104 Q 185 108 192 132" fill="#FF8F00"/>
      <ellipse cx="145" cy="148" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="165" cy="148" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
      <circle cx="145" cy="148" r="4.5" fill="#1A237E"/><circle cx="165" cy="148" r="4.5" fill="#1A237E"/>
      <circle cx="147" cy="146" r="1.8" fill="white"/><circle cx="167" cy="146" r="1.8" fill="white"/>
      <path d="M142 164 Q155 173 168 164" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="155" cy="148" rx="5" ry="3" fill="#FFD700" stroke="#FF8F00" strokeWidth="1"/>
      {/* Body */}
      <ellipse cx="155" cy="270" rx="45" ry="58" fill="#FF8F00" opacity={0.75} stroke="#E65100" strokeWidth="2"/>
      <text x="155" y="365" textAnchor="middle" fontSize="36">🦚</text>
      <text x="155" y="398" textAnchor="middle" fontSize="10" fill="#FFD700">Symbol: Lion 🦁</text>
      <text x="155" y="418" textAnchor="middle" fontSize="9" fill="#FFB74D">Born: 599 BCE · Vaishali, Bihar</text>
      <text x="155" y="436" textAnchor="middle" fontSize="9" fill="#FFB74D">Moksha: Pavapuri · 527 BCE</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#F57F17",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>24th &amp; LAST TIRTHANKAR</div>
      <div style={{fontSize:18,fontWeight:900,color:"#E65100",lineHeight:1.2,marginBottom:4,fontFamily:"sans-serif"}}>महावीर स्वामी 🦚<br/><span style={{fontSize:13,fontWeight:600}}>Our Era&apos;s Great Guide!</span></div>
      <div style={{fontSize:12,color:"#4E342E",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        Lord <strong>Vardhamana Mahavir</strong> is the 24th and last Tirthankar of our time cycle. He was born in <em>Vaishali (Bihar)</em> as a prince but gave up everything at age 30!
        <br/><br/>
        After <strong>12.5 years of intense meditation</strong>, he got Kevalgyan and taught the world the path of Ahimsa, Anekanta and Aparigraha!
      </div>
      {[
        ["🦁","Symbol: Lion — greatest courage!"],
        ["🌿","Colour: Golden Yellow"],
        ["👑","Born: Prince of Vaishali, Bihar"],
        ["🧘","Meditating 12.5 years — barefoot, no shelter!"],
        ["🌸","Moksha: Pavapuri on Diwali night!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:10.5,padding:"4px 9px",borderRadius:8,marginBottom:4,background:"#FFF3E0",border:"1px solid #FFB74D",color:"#4E342E",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{marginTop:8,padding:"8px 12px",background:"#E65100",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif"}}>
        🦚 <strong>Mahavir means</strong> &quot;Great Hero&quot; — he conquered all inner enemies! We celebrate Mahavir Jayanti on his birthday and Diwali on his Moksha day! ✨
      </div>
    </>
  }/>;
}

function TP6() {
  return <BL lb="#1a1000" rb="#FFF9C4" rc="#4E342E" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#1a1000"/>
      <rect width="310" height="52" fill="#FF8F00"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">5 SPECIAL POWERS OF TIRTHANKARAS</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFD700">पाँच विशेष शक्तियाँ</text>
      {[
        [155,125,"#FFD700","🧠","Kevalgyan","Infinite knowledge — knows all past, present & future!"],
        [80, 220,"#FF9800","👁","Kevaldarshan","Infinite sight — sees every soul, every corner!"],
        [230,220,"#4CAF50","💪","Infinite Power","No fatigue, no hunger, no sleep needed!"],
        [80, 340,"#E91E63","💝","No Karma","Zero karma — nothing sticks to their soul!"],
        [230,340,"#9C27B0","✨","Samavasaran","Their divine hall where all creatures sit in peace!"],
      ].map(([x,y,c,em,n,d],i)=>(
        <g key={i}>
          <circle cx={+x} cy={+y} r={38} fill={c as string} opacity={0.18}/>
          <circle cx={+x} cy={+y} r={28} fill={c as string} opacity={0.5}/>
          <text x={+x} y={(+y)-6} textAnchor="middle" fontSize="18">{em as string}</text>
          <text x={+x} y={(+y)+9} textAnchor="middle" fontSize="8" fill="white" fontWeight="900">{n as string}</text>
        </g>
      ))}
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#FF8F00",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 7 · SPECIAL POWERS</div>
      <div style={{fontSize:19,fontWeight:900,color:"#E65100",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>5 विशेष शक्तियाँ!<br/><span style={{fontSize:13,fontWeight:600}}>5 Atishaya — Special Powers</span></div>
      {[
        ["#FFD700","🧠 Kevalgyan","Knows everything — every atom in the universe, every soul, past-present-future. All at once!"],
        ["#FF9800","👁 Kevaldarshan","Sees everything — no darkness, no distance, no barrier. Perfect infinite sight!"],
        ["#4CAF50","💪 Infinite Power","No need to eat, sleep or breathe. Their body never gets tired, sick or aged!"],
        ["#E91E63","💝 No Karma","Not even the tiniest karma particle can stick to them. Perfectly free!"],
        ["#9C27B0","✨ Samavasaran","A divine golden hall appears where gods, humans and animals all sit to listen their teaching in peace!"],
      ].map(([c,n,d])=>(
        <div key={n as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:`${c}20`,border:`1px solid ${c}50`,color:"#4E342E",fontFamily:"sans-serif"}}>
          <strong style={{color:c as string}}>{n as string}</strong> — {d as string}
        </div>
      ))}
    </>
  }/>;
}

function TP7() {
  return <BL lb="#100600" rb="linear-gradient(160deg,#100600,#2a0e00)" rc="#FF9800" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#100600"/>
      {/* All 24 tirthankaras as dots in circle */}
      {Array.from({length:24},(_,i)=>{
        const a=(i/24)*2*Math.PI-Math.PI/2;
        const colors=["#FFD700","#FF9800","#4CAF50","#2196F3","#E91E63","#9C27B0"];
        return <g key={i}>
          <circle cx={155+105*Math.cos(a)} cy={240+105*Math.sin(a)} r={10} fill={colors[i%6]} opacity={0.85}/>
          <text x={155+105*Math.cos(a)} y={244+105*Math.sin(a)} textAnchor="middle" fontSize="8" fill="white" fontWeight="900">{i+1}</text>
        </g>;
      })}
      <circle cx="155" cy="240" r="55" fill="#FF9800" opacity={0.15}/>
      <circle cx="155" cy="240" r="38" fill="#FF8F00" opacity={0.4}/>
      <circle cx="155" cy="240" r="24" fill="#FFD700"/>
      <text x="155" y="234" textAnchor="middle" fontSize="9" fill="#1a0800" fontWeight="900">24 Jina</text>
      <text x="155" y="248" textAnchor="middle" fontSize="8" fill="#1a0800">Namastute 🙏</text>
      <text x="155" y="90" textAnchor="middle" fontSize="12" fill="#FF9800" fontWeight="900">जय जिनेन्द्र! 🙏</text>
      <text x="155" y="110" textAnchor="middle" fontSize="10" fill="#FFB74D">Victory to the Victorious Ones!</text>
      <rect x="30" y="400" width="250" height="48" rx="14" fill="#FF8F00" opacity={0.85}/>
      <text x="155" y="420" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">जय जिनेन्द्र 24 तीर्थंकरों को</text>
      <text x="155" y="438" textAnchor="middle" fontSize="9" fill="#FFF9C4">हमारा शत शत नमन है! 🙏</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.3em",color:"#FF9800",fontWeight:800,fontFamily:"sans-serif",marginBottom:12}}>FINAL PAGE</div>
      <div style={{fontSize:26,fontWeight:900,color:"#FF9800",lineHeight:1.1,marginBottom:8,fontFamily:"sans-serif"}}>जय जिनेन्द्र! 🙏<br/><span style={{fontSize:14,color:"#FFB74D"}}>Bow to All 24!</span></div>
      <div style={{fontSize:12,color:"#FFE0B2",lineHeight:1.7,marginBottom:14,fontFamily:"sans-serif"}}>
        All 24 Tirthankaras walked the same path — from attachment and karma, to complete liberation and Moksha! They are our greatest inspiration!
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
        {TIRTHS.map(t=>(
          <div key={t.n} style={{fontSize:10,padding:"4px 8px",borderRadius:8,background:`${t.color}40`,border:`1px solid ${t.color}60`,color:"#4E342E",fontFamily:"sans-serif"}}>
            {t.em} {t.n} ({t.num})
          </div>
        ))}
        <div style={{fontSize:10,padding:"4px 8px",borderRadius:8,background:"rgba(255,152,0,0.2)",color:"#FF9800",fontFamily:"sans-serif"}}>...and 18 more!</div>
      </div>
      <div style={{padding:"12px 14px",background:"rgba(255,152,0,0.15)",border:"1.5px solid rgba(255,152,0,0.4)",borderRadius:14,color:"#FFE0B2",fontSize:12,fontFamily:"sans-serif"}}>
        🙏 <strong style={{color:"#FFD700"}}>Daily practice:</strong><br/>
        Say &quot;Jai Jinendra!&quot; (जय जिनेन्द्र) when you meet any Jain person — it means &quot;Victory to the Victorious Ones!&quot; 🌟
      </div>
    </>
  }/>;
}
