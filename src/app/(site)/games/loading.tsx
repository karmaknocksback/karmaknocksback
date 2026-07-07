export default function GamesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg,#FFF9C4 0%,#E1F5FE 35%,#F8BBD9 70%,#DCEDC8 100%)" }}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🎮</div>
        <div className="flex gap-2 justify-center mb-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-3 h-3 rounded-full animate-bounce"
              style={{ background: ["#FF9800","#E91E63","#4CAF50","#9C27B0"][i],
                animationDelay: `${i*0.15}s`, animationDuration:"0.7s" }}/>
          ))}
        </div>
        <p className="font-hindi text-sm text-amber-700">कर्म किड्स वर्ल्ड लोड हो रहा है…</p>
      </div>
    </div>
  );
}
