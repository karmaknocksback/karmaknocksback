"use client";
import { useBookMedia } from "../useBookMedia";
import BookPageMedia from "../BookPageMedia";
import { useState, useCallback } from "react";

const PAGES = [
  { label:"📖 Cover",             color:"#4CAF50" },
  { label:"🙏 The 5 Parmesthis", color:"#2E7D32" },
  { label:"📿 Arihant",          color:"#388E3C" },
  { label:"✨ Siddha",           color:"#1B5E20" },
  { label:"🎓 Acharya",         color:"#43A047" },
  { label:"📚 Upadhyay",        color:"#00897B" },
  { label:"🧘 Sadhu",           color:"#00796B" },
  { label:"🌟 Power of Navkar", color:"#2E7D32" },
];

export default function NavkarBook() {
  const bookMedia = useBookMedia("navkar");
  const [cur, setCur] = useState(0);
  const [anim, setAnim] = useState(false);

  const goTo = useCallback((i: number) => {
    if (i === cur || anim) return;
    setAnim(true);
    setTimeout(() => { setCur(i); setAnim(false); }, 320);
  }, [cur, anim]);

  const pages = [NP0, NP1, NP2, NP3, NP4, NP5, NP6, NP7];
  const P = pages[cur];

  return (
    <div className="flex flex-col items-center px-4">
      <div style={{ width:"min(680px,100%)", borderRadius:20, overflow:"hidden",
        boxShadow:`0 0 0 2px ${PAGES[cur].color}40, 0 40px 80px rgba(0,0,0,0.7)`,
        transform:anim?"scale(0.97) rotateY(-6deg)":"scale(1) rotateY(0deg)",
        transition:"transform 0.32s ease", perspective:1200 }}>
        <P />
      </div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginTop:24}}>
        <NavBtn onClick={()=>goTo(cur-1)} disabled={cur===0} color={PAGES[cur].color}>‹</NavBtn>
        <div style={{display:"flex",gap:6}}>
          {PAGES.map((p,i)=>(
            <button key={i} onClick={()=>goTo(i)} style={{width:cur===i?20:8,height:8,borderRadius:99,background:cur===i?p.color:"rgba(255,255,255,0.2)",transition:"all 0.2s"}}/>
          ))}
        </div>
        <NavBtn onClick={()=>goTo(cur+1)} disabled={cur===PAGES.length-1} color={PAGES[cur].color} primary>›</NavBtn>
      </div>
      <p style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:8,fontFamily:"sans-serif"}}>{PAGES[cur].label} · {cur+1}/{PAGES.length}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:12,maxWidth:500}}>
        {PAGES.map((p,i)=>(
          <button key={i} onClick={()=>goTo(i)} style={{borderRadius:99,padding:"4px 10px",fontSize:10,fontFamily:"sans-serif",cursor:"pointer",background:cur===i?`${p.color}30`:"rgba(255,255,255,0.05)",border:`1px solid ${cur===i?p.color:"rgba(255,255,255,0.1)"}`,color:cur===i?p.color:"rgba(255,255,255,0.4)"}}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavBtn({children,onClick,disabled,color,primary}:{children:React.ReactNode;onClick:()=>void;disabled:boolean;color:string;primary?:boolean}) {
  return <button onClick={onClick} disabled={disabled} style={{width:42,height:42,borderRadius:"50%",border:`2px solid ${primary?color:"rgba(255,255,255,0.2)"}`,background:primary?`${color}30`:"rgba(255,255,255,0.05)",color:primary?color:"rgba(255,255,255,0.7)",fontSize:20,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.25:1}}>{children}</button>;
}

function BookLayout({left,right,lb="#0d2818",rb="#E8F5E9",rc="#1B5E20"}:{left:React.ReactNode;right:React.ReactNode;lb?:string;rb?:string;rc?:string}) {
  return (
    <div style={{display:"flex",minHeight:"min(480px,72vw)",maxHeight:520,width:"100%"}}>
      <div style={{width:"50%",background:lb,position:"relative",overflow:"hidden"}}>{left}</div>
      <div style={{width:"50%",background:rb,color:rc,padding:"24px 20px",display:"flex",flexDirection:"column",overflow:"hidden"}}>{right}</div>
    </div>
  );
}

// NAVKAR PAGES
function NP0({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return (
    <BookLayout lb="#0d2818" rb="linear-gradient(160deg,#0d2818,#1a4a2e)" rc="#4CAF50" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#0a1f10"/>
        {[[30,30,2,"#4CAF50"],[80,18,1.5,"#fff"],[200,25,2,"#81C784"],[270,12,1.5,"#fff"],[150,8,2.5,"#4CAF50"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.8}/>)}
        {/* Big lotus */}
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <ellipse key={i} cx="155" cy="200" rx="18" ry="40" fill="#4CAF50" opacity={0.7} stroke="#2E7D32" strokeWidth={1.5} transform={`rotate(${a} 155 200)`}/>
        ))}
        <circle cx="155" cy="200" r="32" fill="#1B5E20"/>
        <circle cx="155" cy="200" r="22" fill="#4CAF50" opacity={0.9}/>
        <text x="155" y="196" textAnchor="middle" fontSize="14" fill="white" fontWeight="900">णमो</text>
        <text x="155" y="212" textAnchor="middle" fontSize="12" fill="#C8E6C9">अरिहंताणं</text>
        {/* Rays */}
        {[0,60,120,180,240,300].map((a,i)=>(
          <line key={i} x1="155" y1="200" x2={155+70*Math.cos(a*Math.PI/180)} y2={200+70*Math.sin(a*Math.PI/180)} stroke="#4CAF50" strokeWidth="1.5" opacity="0.35"/>
        ))}
        {/* Chintu meditating */}
        <circle cx="155" cy="385" r="24" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <circle cx="148" cy="380" r="3.5" fill="#1565C0"/><circle cx="162" cy="380" r="3.5" fill="#1565C0"/>
        <path d="M149 393 Q155 399 161 393" stroke="#E65100" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <text x="155" y="370" textAnchor="middle" fontSize="14">🧘</text>
        <rect x="80" y="438" width="150" height="30" rx="12" fill="#4CAF50" opacity="0.9"/>
        <text x="155" y="457" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">📿 Navkar Mantra</text>
      </svg>
    } right={
      <>
        <div style={{fontSize:9,letterSpacing:"0.3em",color:"#4CAF50",fontWeight:800,fontFamily:"sans-serif",marginBottom:12}}>BOOK 2 · NAVKAR MANTRA</div>
        <div style={{fontSize:26,fontWeight:900,lineHeight:1.1,color:"#4CAF50",marginBottom:8,fontFamily:"sans-serif"}}>नवकार<br/>मंत्र की<br/>जादू ✨</div>
        <div style={{fontSize:14,color:"#81C784",fontWeight:700,marginBottom:16,fontFamily:"sans-serif"}}>Navkar Mantra Magic!</div>
        <div style={{fontSize:12,color:"#C8E6C9",lineHeight:1.8,fontFamily:"sans-serif",marginBottom:16}}>
          The world&apos;s most powerful mantra has <strong style={{color:"#4CAF50"}}>5 lines</strong> — each bowing to a different category of great souls!<br/><br/>
          Join Chintu as he discovers <em>who</em> these 5 souls are and <em>why</em> they are so special!
        </div>
        <div style={{padding:"12px 14px",background:"rgba(76,175,80,0.15)",border:"1.5px solid rgba(76,175,80,0.35)",borderRadius:14,fontSize:13,color:"#A5D6A7",fontFamily:"sans-serif",lineHeight:2}}>
          णमो अरिहंताणं<br/>
          णमो सिद्धाणं<br/>
          णमो आइरियाणं<br/>
          णमो उवज्झायाणं<br/>
          णमो लोए सव्व साहूणं
        </div>
        <div style={{marginTop:"auto",fontSize:11,color:"rgba(76,175,80,0.5)",fontFamily:"sans-serif"}}>Ages 5+ · 8 pages · Digambara Jain</div>
      </>
    }/>
  );
}

function NP1({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  const parmesthis = [
    { n:"अरिहंत", e:"Arihant", d:"Conquered inner enemies — anger, pride, deceit, greed!", c:"#FFD700", em:"⚔️" },
    { n:"सिद्ध", e:"Siddha", d:"Perfectly liberated souls. Reached Moksha!", c:"#E1F5FE", em:"✨" },
    { n:"आचार्य", e:"Acharya", d:"Head of monks. Teaches and guides the path.", c:"#FF9800", em:"🎓" },
    { n:"उपाध्याय", e:"Upadhyay", d:"Monk teacher. Teaches the scriptures.", c:"#CE93D8", em:"📚" },
    { n:"साधु", e:"Sadhu", d:"All Jain monks. Walk the path of liberation.", c:"#A5D6A7", em:"🧘" },
  ];
  return (
    <BookLayout lb="#0a1a08" rb="#E8F5E9" rc="#1B5E20" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#0a1a08"/>
        <rect width="310" height="52" fill="#1B5E20"/>
        <text x="155" y="24" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">5 परमेष्ठी — THE 5 PARMESTHIS</text>
        <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#A5D6A7">जिन्हें हम नवकार में नमन करते हैं</text>
        {/* 5 glowing orbs in a diamond pattern */}
        {[
          [155, 120, "#FFD700", "⚔️", "अरिहंत"],
          [85,  210, "#E1F5FE", "✨", "सिद्ध"],
          [225, 210, "#FF9800", "🎓", "आचार्य"],
          [110, 300, "#CE93D8", "📚", "उपाध्याय"],
          [200, 300, "#A5D6A7", "🧘", "साधु"],
        ].map(([x,y,c,em,n],i)=>(
          <g key={i}>
            <circle cx={+x} cy={+y} r={36} fill={c as string} opacity={0.2}/>
            <circle cx={+x} cy={+y} r={28} fill={c as string} opacity={0.4}/>
            <circle cx={+x} cy={+y} r={20} fill={c as string} opacity={0.85}/>
            <text x={+x} y={+y-4} textAnchor="middle" fontSize="14">{em as string}</text>
            <text x={+x} y={+y+11} textAnchor="middle" fontSize="9" fill="#0a1a08" fontWeight="900">{n as string}</text>
          </g>
        ))}
        {/* Connection lines */}
        <line x1="155" y1="148" x2="85" y2="182" stroke="#4CAF50" strokeWidth="1" opacity="0.35"/>
        <line x1="155" y1="148" x2="225" y2="182" stroke="#4CAF50" strokeWidth="1" opacity="0.35"/>
        <line x1="85" y1="238" x2="110" y2="272" stroke="#4CAF50" strokeWidth="1" opacity="0.35"/>
        <line x1="225" y1="238" x2="200" y2="272" stroke="#4CAF50" strokeWidth="1" opacity="0.35"/>
        <text x="155" y="390" textAnchor="middle" fontSize="10" fill="#4CAF50" fontWeight="700">5 Great Souls we bow to!</text>
        <text x="155" y="408" textAnchor="middle" fontSize="10" fill="#81C784">हम इन्हें नमन करते हैं 🙏</text>
      </svg>
    } right={
      <>
        <div style={{fontSize:9,letterSpacing:"0.2em",color:"#388E3C",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 2 · 5 PARMESTHIS</div>
        <div style={{fontSize:19,fontWeight:900,color:"#1B5E20",marginBottom:6,fontFamily:"sans-serif"}}>5 परमेष्ठी!<br/><span style={{fontSize:13,fontWeight:600}}>The 5 Great Souls</span></div>
        <div style={{fontSize:12,color:"#2E7D32",lineHeight:1.6,marginBottom:8,fontFamily:"sans-serif"}}>
          Navkar Mantra bows to <strong>5 categories</strong> of the greatest souls in the universe — not specific people, but <em>anyone</em> who reaches that level!
        </div>
        {parmesthis.map((p,i)=>(
          <div key={i} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:`${p.c}25`,border:`1px solid ${p.c}60`,color:"#1B5E20",fontFamily:"sans-serif"}}>
            <strong style={{color:p.c}}>{p.em} {p.n} ({p.e})</strong> — {p.d}
          </div>
        ))}
        <div style={{marginTop:8,padding:"8px 12px",background:"#C8E6C9",borderRadius:10,fontSize:11,color:"#1B5E20",fontFamily:"sans-serif"}}>
          🌟 <strong>Amazing fact:</strong> Navkar doesn&apos;t say any specific name — we bow to the <em>quality</em>, not the person!
        </div>
      </>
    }/>
  );
}

// Simplified remaining pages
function NP2({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) { return <SimpleNavkarPage num={2} title="अरिहंत — The Conqueror ⚔️" titleEn="Arihant — Who Won the Inner Battle!" color="#FFD700" bgDark="#1a1400" bgLight="#FFF9C4" colorDark="#5D4037" icon="⚔️" body={<><p>An <strong>Arihant</strong> is someone who has <em>conquered all 4 inner enemies</em> — Krodh (anger), Maan (pride), Maya (deceit), and Lobh (greed)!</p><br/><p>They still live in the world, but <strong>no karma sticks to them</strong>. They teach us the path to freedom.</p><br/><p>Lord Mahavir was the 24th Arihant of this time cycle!</p></>} example="🦁 Chintu asks: 'If someone shouts at Arihant, do they get angry?' NEVER! They are as calm as the ocean. No storm can disturb them! 🌊" story="Lord Mahavir sat in meditation. A farmer tied a nail through his ear. He didn't flinch. That is an Arihant — completely peaceful! 😇"/>;
}

function NP3({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) { return <SimpleNavkarPage num={3} title="सिद्ध — The Perfectly Free ✨" titleEn="Siddha — Soul That Reached Moksha!" color="#E1F5FE" bgDark="#001a2e" bgLight="#E1F5FE" colorDark="#01579B" icon="✨" body={<><p>A <strong>Siddha</strong> is a soul that has shed ALL karma and reached <em>Moksha (मोक्ष)</em> — the top of the universe!</p><br/><p>They have <strong>infinite knowledge, sight, bliss and power</strong>. No more birth, no more death — free forever!</p><br/><p>There are <em>infinite Siddhas</em> living in Siddha Loka at this very moment!</p></>} example="🌟 Siddhas don't need to eat, sleep or breathe. They are pure consciousness — like a perfect light that never goes off! 💡" story="Priya asks: 'Can Siddhas hear my prayers?' The teacher smiles: 'They don't hear individually — but YOUR prayer purifies YOUR soul!' 🌸"/>;
}

function NP4({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) { return <SimpleNavkarPage num={4} title="आचार्य — The Master Teacher 🎓" titleEn="Acharya — Head of the Monk Community!" color="#FF9800" bgDark="#1a0e00" bgLight="#FFF3E0" colorDark="#4E342E" icon="🎓" body={<><p>An <strong>Acharya</strong> is the head of a group of Jain monks. They have learned all 12 Jain scriptures and guide others!</p><br/><p>They walk barefoot, eat once a day, never stay in one place too long, and teach the path of liberation.</p></>} example="🎓 An Acharya is like the captain of a spiritual team. All the monks listen to them and follow their example every single day!" story="Young Chintu saw an Acharya walk barefoot in winter. 'Doesn't it hurt?' he asked. The Acharya smiled: 'The body feels, but I am not the body!' 🙏"/>;
}

function NP5({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) { return <SimpleNavkarPage num={5} title="उपाध्याय — The Scholar Monk 📚" titleEn="Upadhyay — Teaches the Holy Scriptures!" color="#CE93D8" bgDark="#1a0020" bgLight="#F3E5F5" colorDark="#4A148C" icon="📚" body={<><p>An <strong>Upadhyay</strong> is a monk whose special duty is to teach the <em>Agam scriptures</em> — the holy books of Jainism!</p><br/><p>They have mastered at least 11 of the 12 main scriptures and spend their life teaching others.</p></>} example="📚 If Acharya is the school principal, Upadhyay is the best teacher! Every monk learns from them daily." story="Priya listened as Upadhyay explained karma for 3 hours. 'Can I become Upadhyay?' she asked. 'Anyone can — if you walk the right path!' 🌟"/>;
}

function NP6({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) { return <SimpleNavkarPage num={6} title="साधु — The Holy Monk 🧘" titleEn="Sadhu — All Jain Monks on the Path!" color="#A5D6A7" bgDark="#0a1a08" bgLight="#E8F5E9" colorDark="#1B5E20" icon="🧘" body={<><p>A <strong>Sadhu (साधु)</strong> means all Jain monks and Sadhvis (nuns). They have taken the 5 great vows!</p><br/><ul style={{paddingLeft:18,lineHeight:2}}><li>Ahimsa — No violence</li><li>Satya — Only truth</li><li>Asteya — No stealing</li><li>Brahmacharya — Celibacy</li><li>Aparigraha — No possessions</li></ul></>} example="🧘 Sadhus own nothing — no phone, no money, no house. But they carry the greatest treasure: a soul getting closer to Moksha every day!" story="Chintu gave fruit to a Sadhu. 'Why are you happy? You have nothing!' The Sadhu laughed: 'I have everything — freedom from wanting!' 😊"/>;
}

function NP7({pageMedia}:{pageMedia?:{imageUrl:string|null;audioUrl:string|null;caption:string|null}}) {
  return (
    <BookLayout lb="#0a1a08" rb="#E8F5E9" rc="#1B5E20" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#0a1a08"/>
        <rect width="310" height="52" fill="#1B5E20"/>
        <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">THE POWER OF NAVKAR MANTRA</text>
        <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#A5D6A7">नवकार मंत्र की अद्भुत शक्ति</text>
        {/* Mantra lines glowing */}
        {["णमो अरिहंताणं","णमो सिद्धाणं","णमो आइरियाणं","णमो उवज्झायाणं","णमो लोए सव्व साहूणं"].map((line,i)=>(
          <g key={i}>
            <rect x="30" y={100+i*56} width="250" height="44" rx="10" fill="#4CAF50" opacity={0.15+(i*0.08)}/>
            <rect x="30" y={100+i*56} width="250" height="44" rx="10" fill="none" stroke="#4CAF50" strokeWidth="1" opacity="0.4"/>
            <text x="155" y={117+i*56} textAnchor="middle" fontSize="11" fill="#4CAF50" fontWeight="700">{line}</text>
            <text x="155" y={132+i*56} textAnchor="middle" fontSize="9" fill="#A5D6A7" opacity="0.8">
              {["Bow to Arihants","Bow to Siddhas","Bow to Acharyas","Bow to Upadhyays","Bow to all Sadhus"][i]}
            </text>
          </g>
        ))}
        {/* Chintu chanting */}
        <circle cx="155" cy="420" r="22" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <text x="155" y="428" textAnchor="middle" fontSize="12">🙏</text>
        {/* sparkles */}
        {[[60,395,12],[240,390,10],[100,360,8],[210,365,10]].map(([x,y,fs],i)=><text key={i} x={x} y={y} fontSize={fs} fill="#4CAF50" opacity="0.7">✦</text>)}
      </svg>
    } right={
      <>
        <div style={{fontSize:9,letterSpacing:"0.2em",color:"#388E3C",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>FINAL PAGE · POWER</div>
        <div style={{fontSize:19,fontWeight:900,color:"#1B5E20",marginBottom:8,fontFamily:"sans-serif"}}>नवकार की<br/>महाशक्ति! 🌟</div>
        <div style={{fontSize:12,color:"#2E7D32",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
          When you say Navkar Mantra, you are connecting your soul to the energy of the greatest souls ever! The mantra doesn&apos;t ask for anything — it just <strong>purifies YOUR soul</strong>!
        </div>
        {[
          ["🌅","Say it in morning","Start your day with pure energy!"],
          ["😰","Say it when scared","Fear disappears instantly!"],
          ["😔","Say it when sad","Peace fills your heart!"],
          ["🛏","Say it at night","Sleep with a clean soul!"],
        ].map(([em,t,d])=>(
          <div key={t as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#C8E6C9",color:"#1B5E20",fontFamily:"sans-serif"}}>
            {em as string} <strong>{t as string}</strong> — {d as string}
          </div>
        ))}
        <div style={{marginTop:8,padding:"10px 12px",background:"#1B5E20",borderRadius:12,fontSize:12,color:"#C8E6C9",fontFamily:"sans-serif",textAlign:"center"}}>
          🙏 <strong style={{color:"#FFD700"}}>Say Navkar 9 times every morning!</strong><br/>
          9 × Navkar = Powerful karma protection!
        </div>
      </>
    }/>
  );
}

function SimpleNavkarPage({num,title,titleEn,color,bgDark,bgLight,colorDark,icon,body,example,story}:{num:number;title:string;titleEn:string;color:string;bgDark:string;bgLight:string;colorDark:string;icon:string;body:React.ReactNode;example:string;story:string}) {
  return (
    <BookLayout lb={bgDark} rb={bgLight} rc={colorDark} left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill={bgDark}/>
        <rect width="310" height="52" fill={color} opacity="0.8"/>
        <text x="155" y="26" textAnchor="middle" fontSize="12" fill={bgDark} fontWeight="900">PAGE {num}</text>
        <text x="155" y="42" textAnchor="middle" fontSize="9" fill={bgDark} opacity="0.8">{title.split("—")[0].trim()}</text>
        {/* Big icon */}
        {[80,60,42].map((r,i)=><circle key={i} cx="155" cy="210" r={r} fill={color} opacity={[0.1,0.2,0.35][i]}/>)}
        <circle cx="155" cy="210" r="28" fill={color} opacity="0.9}"/>
        <text x="155" y="222" textAnchor="middle" fontSize="36">{icon}</text>
        {/* Mantra line highlight */}
        <rect x="20" y="330" width="270" height="50" rx="12" fill={color} opacity="0.2"/>
        <rect x="20" y="330" width="270" height="50" rx="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5"/>
        <text x="155" y="350" textAnchor="middle" fontSize="10" fill={color} fontWeight="700">
          {["","णमो अरिहंताणं","णमो सिद्धाणं","णमो आइरियाणं","णमो उवज्झायाणं","णमो लोए सव्व साहूणं","",""][num] || ""}
        </text>
        <text x="155" y="368" textAnchor="middle" fontSize="9" fill={color} opacity="0.7">
          {["","We bow to Arihants","We bow to Siddhas","We bow to Acharyas","We bow to Upadhyays","We bow to all Sadhus","",""][num] || ""}
        </text>
        {/* sparkles */}
        {[[40,280,12],[270,290,10],[60,400,10],[250,410,12]].map(([x,y,fs],i)=><text key={i} x={x} y={y} fontSize={fs} fill={color} opacity="0.5">✦</text>)}
      </svg>
    } right={
      <>
        <div style={{fontSize:9,letterSpacing:"0.2em",color,fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE {num} · NAVKAR SERIES</div>
        <div style={{fontSize:18,fontWeight:900,color:colorDark,lineHeight:1.2,marginBottom:4,fontFamily:"sans-serif"}}>{title}</div>
        <div style={{fontSize:12,color,fontWeight:600,marginBottom:10,fontFamily:"sans-serif"}}>{titleEn}</div>
        <div style={{fontSize:12,color:colorDark,lineHeight:1.68,marginBottom:8,fontFamily:"sans-serif"}}>{body}</div>
        <div style={{fontSize:11,padding:"8px 12px",borderRadius:10,marginBottom:6,background:`${color}20`,border:`1px solid ${color}40`,color:colorDark,fontFamily:"sans-serif"}}>{example}</div>
        <div style={{fontSize:11,padding:"8px 12px",borderRadius:10,background:`${color}15`,border:`1px solid ${color}30`,color:colorDark,fontFamily:"sans-serif",fontStyle:"italic"}}>{story}</div>
      </>
    }/>
  );
}
