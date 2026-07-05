"use client";
import { useState } from "react";

const PAGES = [
  {label:"📖 Cover",color:"#E91E63"},
  {label:"🌸 What is Paryushana?",color:"#C2185B"},
  {label:"🧹 Pratikraman",color:"#AD1457"},
  {label:"📿 Micchami Dukkadam",color:"#880E4F"},
  {label:"🍎 Paryushana Fasting",color:"#E91E63"},
  {label:"📖 Kalpa Sutra",color:"#C2185B"},
  {label:"💝 Forgiveness Stories",color:"#AD1457"},
  {label:"🌟 My Paryushana Pledge",color:"#880E4F"},
];

function NavBtn({d,onClick,disabled,color,primary}:{d:React.ReactNode;onClick:()=>void;disabled:boolean;color:string;primary?:boolean}) {
  return <button onClick={onClick} disabled={disabled} style={{width:42,height:42,borderRadius:"50%",border:`2px solid ${primary?color:"rgba(255,255,255,0.2)"}`,background:primary?`${color}30`:"rgba(255,255,255,0.05)",color:primary?color:"rgba(255,255,255,0.7)",fontSize:20,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.25:1}}>{d}</button>;
}

function BL({left,right,lb="#1a0020",rb="#FCE4EC",rc="#880E4F"}:{left:React.ReactNode;right:React.ReactNode;lb?:string;rb?:string;rc?:string}) {
  return (
    <div style={{display:"flex",minHeight:"min(480px,72vw)",maxHeight:520}}>
      <div style={{width:"50%",background:lb,overflow:"hidden",position:"relative"}}>{left}</div>
      <div style={{width:"50%",background:rb,color:rc,padding:"22px 20px",display:"flex",flexDirection:"column",overflow:"hidden"}}>{right}</div>
    </div>
  );
}

export default function ParyushanaBook() {
  const [cur,setCur]=useState(0);
  const comps=[PP0,PP1,PP2,PP3,PP4,PP5,PP6,PP7];
  const P=comps[cur]??PP0;
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

function PP0() {
  return <BL lb="#1a0020" rb="linear-gradient(160deg,#1a0020,#3d0035)" rc="#E91E63" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#12001a"/>
      {[[30,30,2,"#E91E63"],[200,20,1.5,"#fff"],[260,14,2,"#FF80AB"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.8}/>)}
      {/* Lotus flowers */}
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <ellipse key={i} cx="155" cy="200" rx="16" ry="36" fill="#E91E63" opacity={0.65} stroke="#C2185B" strokeWidth={1.5} transform={`rotate(${a} 155 200)`}/>
      ))}
      <circle cx="155" cy="200" r="30" fill="#C2185B" opacity={0.8}/>
      <circle cx="155" cy="200" r="20" fill="#FF4081"/>
      <text x="155" y="196" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">मिच्छामि</text>
      <text x="155" y="210" textAnchor="middle" fontSize="9" fill="#FFCDD2">दुक्कडम्</text>
      {/* Chintu bowing to Priya */}
      <circle cx="100" cy="360" r="18" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
      <text x="100" y="357" textAnchor="middle" fontSize="11">🙏</text>
      <path d="M95 378 Q88 395 80 405" stroke="#E65100" strokeWidth="2" fill="none"/>
      <circle cx="210" cy="360" r="18" fill="#FFB74D" stroke="#E65100" strokeWidth="2"/>
      <text x="210" y="365" textAnchor="middle" fontSize="11">💝</text>
      <text x="155" y="430" textAnchor="middle" fontSize="10" fill="#E91E63" fontWeight="700">Forgiveness = Freedom!</text>
      <rect x="55" y="448" width="200" height="26" rx="12" fill="#E91E63" opacity="0.9"/>
      <text x="155" y="465" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">🌸 Paryushana Festival</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.3em",color:"#E91E63",fontWeight:800,fontFamily:"sans-serif",marginBottom:12}}>BOOK 5 · PARYUSHANA</div>
      <div style={{fontSize:26,fontWeight:900,lineHeight:1.1,color:"#E91E63",marginBottom:6,fontFamily:"sans-serif"}}>पर्युषण<br/>पर्व! 🌸</div>
      <div style={{fontSize:13,color:"#F48FB1",fontWeight:700,marginBottom:14,fontFamily:"sans-serif"}}>Festival of Forgiveness!</div>
      <div style={{fontSize:12,color:"#FCE4EC",lineHeight:1.8,fontFamily:"sans-serif",marginBottom:14}}>
        Paryushana is the most important Jain festival! For <strong style={{color:"#E91E63"}}>8–10 days</strong>, Jains dedicate themselves to soul-cleaning through:
        <br/><br/>
        Fasting 🍎 · Prayer 🙏 · Forgiveness 💝 · Reflection 🧘 · Study 📖
      </div>
      <div style={{padding:"12px 14px",background:"rgba(233,30,99,0.15)",border:"1.5px solid rgba(233,30,99,0.35)",borderRadius:14,fontSize:12,color:"#FFCDD2",fontFamily:"sans-serif",lineHeight:1.9}}>
        <strong style={{color:"#E91E63"}}>In this book:</strong><br/>
        ✦ What is Paryushana?<br/>
        ✦ Pratikraman — the soul-cleaning ritual<br/>
        ✦ Micchami Dukkadam<br/>
        ✦ The Paryushana pledge!
      </div>
      <div style={{marginTop:"auto",fontSize:11,color:"rgba(233,30,99,0.5)",fontFamily:"sans-serif"}}>Ages 5+ · 8 pages</div>
    </>
  }/>;
}

function PP1() {
  return <BL lb="#12001a" rb="#FCE4EC" rc="#880E4F" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#12001a"/>
      <rect width="310" height="52" fill="#C2185B"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">WHAT IS PARYUSHANA?</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFCDD2">पर्युषण क्या है?</text>
      {/* Calendar showing 8 days */}
      <rect x="30" y="80" width="250" height="180" rx="14" fill="#C2185B" opacity={0.2}/>
      <text x="155" y="105" textAnchor="middle" fontSize="10" fill="#E91E63" fontWeight="900">8 DAYS OF PARYUSHANA</text>
      {[["Day 1","🙏","Prayer"],["Day 2","📖","Study"],["Day 3","🍎","Fasting"],["Day 4","🧘","Meditation"],["Day 5","💝","Charity"],["Day 6","🌸","Pratikraman"],["Day 7","🙏","More Pratikraman"],["Day 8","💝","Forgiveness Day!"]].map(([d,em,n],i)=>(
        <g key={i}>
          <rect x={35+((i%4)*60)} y={115+Math.floor(i/4)*72} width={52} height={60} rx={8} fill="#C2185B" opacity={0.4+(i===7?0.4:0)}/>
          <text x={61+((i%4)*60)} y={138+Math.floor(i/4)*72} textAnchor="middle" fontSize="18">{em}</text>
          <text x={61+((i%4)*60)} y={152+Math.floor(i/4)*72} textAnchor="middle" fontSize="7" fill="#FFCDD2" fontWeight="700">{d}</text>
          <text x={61+((i%4)*60)} y={164+Math.floor(i/4)*72} textAnchor="middle" fontSize="7" fill="#F48FB1">{n}</text>
        </g>
      ))}
      {/* Soul cleaning visual */}
      <circle cx="155" cy="340" r="50" fill="#E91E63" opacity={0.15}/>
      <circle cx="155" cy="340" r="38" fill="#E91E63" opacity={0.3}/>
      <circle cx="155" cy="340" r="26" fill="#FFD700" opacity={0.9}/>
      <text x="155" y="335" textAnchor="middle" fontSize="9" fill="#880E4F" fontWeight="900">Clean Soul</text>
      <text x="155" y="348" textAnchor="middle" fontSize="9" fill="#6D2A00">After Paryushana!</text>
      <text x="155" y="410" textAnchor="middle" fontSize="10" fill="#E91E63">🌸 Soul gets cleaner every day! 🌸</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#C2185B",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 2 · THE FESTIVAL</div>
      <div style={{fontSize:18,fontWeight:900,color:"#880E4F",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>पर्युषण पर्व! 🌸<br/><span style={{fontSize:13,fontWeight:600}}>The Festival of Self-Purification</span></div>
      <div style={{fontSize:12,color:"#880E4F",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        <strong>Paryushana</strong> means &quot;to stay near the soul.&quot; For 8 days (Shvetambar) or 10 days (Digambar — called <em>Das Lakshan Parva</em>), Jains focus completely on purifying their soul!
        <br/><br/>
        It happens in <strong>Bhadrapada month</strong> (August-September) every year.
      </div>
      {[
        ["🙏","Morning Samayik — 48 minutes of silence and meditation"],
        ["📖","Study of Kalpa Sutra — the holy scripture"],
        ["🍎","Fasting — some eat once, some eat nothing!"],
        ["💝","Pratikraman — the soul-cleaning confession ritual"],
        ["🌸","Forgiveness Day (Samvatsari) — ask everyone for forgiveness!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#F8BBD9",border:"1px solid #F48FB1",color:"#880E4F",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#C2185B",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif",marginTop:4}}>
        💝 Paryushana is like a <strong>spiritual New Year</strong> — you clean your soul and start fresh!
      </div>
    </>
  }/>;
}

function PP2() {
  return <BL lb="#12001a" rb="#FCE4EC" rc="#880E4F" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#12001a"/>
      <rect width="310" height="52" fill="#AD1457"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">PRATIKRAMAN — SOUL CLEANING!</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFCDD2">प्रतिक्रमण — आत्मशुद्धि</text>
      {/* Before and after */}
      <text x="78" y="100" textAnchor="middle" fontSize="10" fill="#EF9A9A" fontWeight="900">BEFORE</text>
      {[40,30,22,14].map((r,i)=><circle key={i} cx="78" cy="175" r={r} fill={["#424242","#616161","#9E9E9E","#BDBDBD"][i]} opacity={0.85}/>)}
      <text x="78" y="180" textAnchor="middle" fontSize="9" fill="#fff">Dirty</text>
      <text x="78" y="192" textAnchor="middle" fontSize="8" fill="#ccc">soul</text>
      <text x="78" y="240" textAnchor="middle" fontSize="9" fill="#EF9A9A">Lots of karma!</text>
      {/* Arrow */}
      <text x="155" y="180" textAnchor="middle" fontSize="22" fill="#E91E63">→</text>
      <text x="155" y="200" textAnchor="middle" fontSize="9" fill="#F48FB1" fontWeight="700">Pratikraman</text>
      <text x="155" y="215" textAnchor="middle" fontSize="8" fill="#FFCDD2">प्रतिक्रमण</text>
      {/* After */}
      <text x="232" y="100" textAnchor="middle" fontSize="10" fill="#80CBC4" fontWeight="900">AFTER</text>
      {[40,30,22,14].map((r,i)=><circle key={i} cx="232" cy="175" r={r} fill={["#E0F7FA","#B2EBF2","#80DEEA","#FFF9C4"][i]} opacity={0.85}/>)}
      <text x="232" y="180" textAnchor="middle" fontSize="9" fill="#006064">Clean</text>
      <text x="232" y="192" textAnchor="middle" fontSize="8" fill="#00838F">soul</text>
      <text x="232" y="240" textAnchor="middle" fontSize="9" fill="#80CBC4">Less karma! ✨</text>
      {/* Steps of Pratikraman */}
      {[
        [155,295,"🙏","Bow to Panch Parmesthi"],
        [155,345,"😔","Confess all hurtful actions"],
        [155,395,"💝","Ask forgiveness sincerely"],
        [155,445,"⭐","Promise to do better"],
      ].map(([x,y,em,text])=>(
        <g key={text as string}>
          <circle cx={+x} cy={+y} r={18} fill="#E91E63" opacity={0.4}/>
          <text x={+x} y={(+y)+6} textAnchor="middle" fontSize="14">{em as string}</text>
          <text x={(+x)+30} y={(+y)+5} fontSize="9" fill="#FFCDD2">{text as string}</text>
        </g>
      ))}
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#AD1457",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 3 · PRATIKRAMAN</div>
      <div style={{fontSize:18,fontWeight:900,color:"#880E4F",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>प्रतिक्रमण! 🧹<br/><span style={{fontSize:13,fontWeight:600}}>The Soul-Cleaning Ritual</span></div>
      <div style={{fontSize:12,color:"#880E4F",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        <strong>Pratikraman</strong> means &quot;going back&quot; — going back to your pure soul by reviewing and confessing all the harm you did through thoughts, words, and actions.
        <br/><br/>
        It is done <strong>twice daily</strong> by monks, and at minimum during Paryushana by everyone!
      </div>
      <div style={{fontSize:12,color:"#C2185B",fontWeight:800,marginBottom:8,fontFamily:"sans-serif"}}>4 Steps of Pratikraman:</div>
      {[
        ["1","🙏","Alochana — Recall all hurtful actions honestly"],
        ["2","😔","Pratikraman — Confess them with a sorry heart"],
        ["3","💝","Pratyakhyan — Promise not to repeat them"],
        ["4","⭐","Kayotsarg — Stand still and let karma shed away!"],
      ].map(([n,em,d])=>(
        <div key={n as string} style={{fontSize:11,padding:"6px 10px",borderRadius:9,marginBottom:6,background:"#F8BBD9",border:"1px solid #F48FB1",color:"#880E4F",fontFamily:"sans-serif"}}>
          <strong>{n as string}.</strong> {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"8px 12px",background:"#AD1457",borderRadius:10,fontSize:11,color:"white",fontFamily:"sans-serif",marginTop:4}}>
        🧹 Pratikraman is like <strong>brushing your teeth for your soul</strong> — do it daily for a sparkling clean soul! ✨
      </div>
    </>
  }/>;
}

function PP3() {
  return <BL lb="#12001a" rb="#FCE4EC" rc="#880E4F" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#12001a"/>
      <rect width="310" height="52" fill="#880E4F"/>
      <text x="155" y="26" textAnchor="middle" fontSize="12" fill="white" fontWeight="900">MICCHAMI DUKKADAM!</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFCDD2">मिच्छामि दुक्कडम्ʼ</text>
      {/* Big heart with the phrase */}
      <path d="M155 290 L60 190 Q40 150 80 125 Q120 100 155 140 Q190 100 230 125 Q270 150 250 190 Z" fill="#E91E63" opacity={0.7}/>
      <path d="M155 272 L72 186 Q55 152 88 132 Q120 112 155 148 Q190 112 222 132 Q255 152 238 186 Z" fill="#FF4081"/>
      <text x="155" y="180" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">मिच्छामि</text>
      <text x="155" y="198" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">दुक्कडम्ʼ</text>
      <text x="155" y="218" textAnchor="middle" fontSize="9" fill="#FFCDD2">&quot;May my bad actions be undone!&quot;</text>
      <text x="155" y="236" textAnchor="middle" fontSize="9" fill="#FFCDD2">&quot;I ask your forgiveness!&quot;</text>
      {/* Chintu and Priya forgiving each other */}
      <circle cx="100" cy="380" r="20" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
      <text x="100" y="373" textAnchor="middle" fontSize="10">🙏</text>
      <text x="100" y="386" textAnchor="middle" fontSize="9" fill="#FFCC80">Chintu</text>
      <path d="M120 380 L190 380" stroke="#E91E63" strokeWidth="2" strokeDasharray="4,2"/>
      <text x="155" y="375" textAnchor="middle" fontSize="14">💝</text>
      <circle cx="210" cy="380" r="20" fill="#FFB74D" stroke="#E65100" strokeWidth="2"/>
      <text x="210" y="373" textAnchor="middle" fontSize="10">💝</text>
      <text x="210" y="386" textAnchor="middle" fontSize="9" fill="#FFB74D">Priya</text>
      <text x="155" y="430" textAnchor="middle" fontSize="9" fill="#E91E63" fontWeight="700">Forgiveness = Freedom from Karma! ✨</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#880E4F",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE 4 · FORGIVENESS</div>
      <div style={{fontSize:17,fontWeight:900,color:"#880E4F",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>मिच्छामि दुक्कडम्ʼ!<br/><span style={{fontSize:13,fontWeight:600}}>The Magic Forgiveness Words</span></div>
      <div style={{fontSize:12,color:"#880E4F",lineHeight:1.7,marginBottom:8,fontFamily:"sans-serif"}}>
        <strong style={{color:"#E91E63"}}>Micchami Dukkadam</strong> is an ancient Prakrit phrase meaning:
        <br/><br/>
        <em style={{color:"#C2185B"}}>&quot;May all the bad actions I have done — intentionally or unintentionally — through body, speech, or mind — be forgiven. Let my bad karma be undone.&quot;</em>
      </div>
      {[
        ["💝","Say it to EVERYONE — family, friends, even enemies!"],
        ["🌍","Modern Jains send this message via WhatsApp on Samvatsari!"],
        ["🙏","It doesn't matter if the other person forgives you — YOUR soul is cleaned by asking!"],
        ["✨","When you truly forgive others, YOUR karma reduces!"],
        ["😊","The one who forgives feels lighter and freer!"],
      ].map(([em,d])=>(
        <div key={d as string} style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:"#F8BBD9",border:"1px solid #F48FB1",color:"#880E4F",fontFamily:"sans-serif"}}>
          {em as string} {d as string}
        </div>
      ))}
      <div style={{padding:"10px 12px",background:"#880E4F",borderRadius:12,fontSize:13,color:"white",fontFamily:"sans-serif",textAlign:"center",marginTop:6,fontWeight:700}}>
        💝 मिच्छामि दुक्कडम्ʼ<br/><span style={{fontSize:10,fontWeight:400,color:"#FFCDD2"}}>Say this to someone today!</span>
      </div>
    </>
  }/>;
}

function PP4() { return <SimpleParPage num={4} title="पर्युषण का उपवास 🍎" titleEn="Paryushana Fasting!" color="#E91E63" body={<><p>During Paryushana, Jains observe different levels of fasting:</p><br/><ul style={{paddingLeft:18,lineHeight:2.2}}><li><strong>Atthai</strong> — fast for 8 days, eat nothing! 🏆</li><li><strong>Upavas</strong> — eat nothing for one day</li><li><strong>Ekasana</strong> — eat only once a day</li><li><strong>Nivi</strong> — eat once, without water after sunset</li></ul><br/><p>Fasting helps burn old karma (Nirjara) quickly!</p></>} example="🍎 Priya did Atthai — 8 days without food! She felt her soul getting lighter and cleaner each day. By day 8 she was GLOWING! ✨" bg="#FCE4EC" fg="#880E4F"/>;
}

function PP5() { return <SimpleParPage num={5} title="कल्पसूत्र — पवित्र ग्रंथ 📖" titleEn="Kalpa Sutra — The Holy Scripture!" color="#C2185B" body={<><p>During Paryushana, Jains listen to the <strong>Kalpa Sutra</strong> — the scripture describing the life of Lord Mahavir, from his birth to his Moksha!</p><br/><p>On the 5th day, the reading of <em>Lord Mahavir&apos;s birth</em> is celebrated with great joy — gifts and sweets!</p><br/><p>This is called <strong>Mahavir Janma Vachana</strong>!</p></>} example="📖 Chintu sat with the whole family listening to Mahavir&apos;s birth story. When the moment came, everyone cheered and sweets were distributed! 🎉" bg="#FCE4EC" fg="#880E4F"/>;
}

function PP6() { return <SimpleParPage num={6} title="माफी की कहानियाँ 💝" titleEn="Forgiveness Stories!" color="#AD1457" body={<><p><strong>Story 1 — The Angry King:</strong><br/>A king was about to execute a monk for entering his palace. The monk said with total peace: &quot;I forgive you for what you are about to do.&quot; The king was so moved he set the monk free and became his disciple!</p><br/><p><strong>Story 2 — Chintu&apos;s apology:</strong><br/>Chintu had said mean words to his friend a year ago. On Samvatsari, he called him and said &quot;Micchami Dukkadam.&quot; His friend cried with happiness. Their friendship became stronger than ever! 💙</p></>} example="💝 Forgiveness breaks the chain of karma. When you forgive — even someone who hurt you — YOU become free!" bg="#FCE4EC" fg="#880E4F"/>;
}

function PP7() {
  const pledges=["I will practice Pratikraman during Paryushana","I will say Micchami Dukkadam to everyone","I will fast for at least one day","I will read Kalpa Sutra with my family","I will forgive everyone who has hurt me","I will do 48 minutes Samayik daily during Paryushana","I will avoid hurting any creature for 10 days","I will donate to someone in need"];
  return <BL lb="#12001a" rb="#FCE4EC" rc="#880E4F" left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#12001a"/>
      <rect width="310" height="52" fill="#880E4F"/>
      <text x="155" y="26" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">MY PARYUSHANA PLEDGE!</text>
      <text x="155" y="42" textAnchor="middle" fontSize="10" fill="#FFCDD2">मेरा पर्युषण संकल्प</text>
      <text x="155" y="130" textAnchor="middle" fontSize="50">🏆</text>
      <text x="155" y="175" textAnchor="middle" fontSize="14" fill="#E91E63" fontWeight="900">Paryushana Champion!</text>
      <text x="155" y="195" textAnchor="middle" fontSize="11" fill="#F48FB1">पर्युषण चैंपियन!</text>
      {[0,60,120,180,240].map((a,i)=>(
        <text key={i} x={155+80*Math.cos(a*Math.PI/180)} y={280+60*Math.sin(a*Math.PI/180)} textAnchor="middle" fontSize="20">🌸</text>
      ))}
      <circle cx="155" cy="290" r="36" fill="#E91E63" opacity={0.3}/>
      <circle cx="155" cy="290" r="25" fill="#E91E63" opacity={0.6}/>
      <text x="155" y="284" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">I AM A</text>
      <text x="155" y="298" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">JAIN HERO!</text>
      <text x="155" y="405" textAnchor="middle" fontSize="11" fill="#E91E63" fontWeight="900">मिच्छामि दुक्कडम्ʼ 🙏</text>
      <text x="155" y="425" textAnchor="middle" fontSize="9" fill="#FFCDD2">I ask forgiveness from all souls!</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:"#880E4F",fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>FINAL PAGE · PLEDGE</div>
      <div style={{fontSize:17,fontWeight:900,color:"#880E4F",lineHeight:1.2,marginBottom:8,fontFamily:"sans-serif"}}>मेरा पर्युषण<br/>संकल्प! 🌸<br/><span style={{fontSize:13,fontWeight:600}}>My Paryushana Pledge</span></div>
      <div style={{fontSize:12,color:"#880E4F",lineHeight:1.6,marginBottom:8,fontFamily:"sans-serif"}}>Tick each one you will do this Paryushana:</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {pledges.map(p=>(
          <div key={p} style={{fontSize:10,padding:"4px 9px",borderRadius:8,background:"#F8BBD9",color:"#880E4F",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:14,height:14,borderRadius:3,border:"1.5px solid #C2185B",display:"inline-block",flexShrink:0}}/>
            {p}
          </div>
        ))}
      </div>
      <div style={{marginTop:8,padding:"8px 12px",background:"#880E4F",borderRadius:10,fontSize:12,color:"white",fontFamily:"sans-serif",textAlign:"center",fontWeight:700}}>
        🌸 मिच्छामि दुक्कडम्ʼ<br/>
        <span style={{fontSize:10,fontWeight:400,color:"#FFCDD2"}}>From Chintu, Priya &amp; the whole KarmaKnocksBack family! 🙏</span>
      </div>
    </>
  }/>;
}

function SimpleParPage({num,title,titleEn,color,body,example,bg,fg}:{num:number;title:string;titleEn:string;color:string;body:React.ReactNode;example:string;bg:string;fg:string}) {
  return <BL lb="#12001a" rb={bg} rc={fg} left={
    <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="480" fill="#12001a"/>
      <rect width="310" height="52" fill={color}/>
      <text x="155" y="26" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">PAGE {num}</text>
      <text x="155" y="42" textAnchor="middle" fontSize="9" fill="#FFCDD2">{title.split("—")[0].trim()}</text>
      {[80,60,44,30].map((r,i)=><circle key={i} cx="155" cy="225" r={r} fill={color} opacity={[0.1,0.18,0.3,0.6][i]}/>)}
      <circle cx="155" cy="225" r="22" fill={color} opacity={0.9}/>
      <text x="155" y="232" textAnchor="middle" fontSize="14">{["","🍎","📖","💝","🌸","💙","🏆","🌸"][num]||"🌸"}</text>
      {[[40,330],[270,340],[80,400],[230,410]].map(([x,y],i)=><text key={i} x={x} y={y} fontSize="14" fill={color} opacity="0.4">🌸</text>)}
      <text x="155" y="380" textAnchor="middle" fontSize="10" fill={color} fontWeight="700" opacity={0.7}>{title}</text>
      <text x="155" y="440" textAnchor="middle" fontSize="9" fill={color} opacity={0.5}>{titleEn}</text>
    </svg>
  } right={
    <>
      <div style={{fontSize:9,letterSpacing:"0.2em",color,fontWeight:800,fontFamily:"sans-serif",marginBottom:8}}>PAGE {num} · PARYUSHANA</div>
      <div style={{fontSize:17,fontWeight:900,color:fg,lineHeight:1.2,marginBottom:4,fontFamily:"sans-serif"}}>{title}</div>
      <div style={{fontSize:12,color,fontWeight:600,marginBottom:10,fontFamily:"sans-serif"}}>{titleEn}</div>
      <div style={{fontSize:12,color:fg,lineHeight:1.68,marginBottom:8,fontFamily:"sans-serif"}}>{body}</div>
      <div style={{fontSize:11,padding:"9px 12px",borderRadius:10,background:`${color}20`,border:`1px solid ${color}50`,color:fg,fontFamily:"sans-serif"}}>{example}</div>
    </>
  }/>;
}
