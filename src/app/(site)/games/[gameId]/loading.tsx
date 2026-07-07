export default function GameLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg,#FFF9C4,#E1F5FE,#F8BBD9)" }}>
      <div className="text-center">
        <div className="text-7xl mb-5 animate-bounce" style={{ animationDuration: "0.9s" }}>🎲</div>
        <div className="flex gap-2 justify-center mb-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-3.5 h-3.5 rounded-full animate-bounce"
              style={{ background: "#FFD700", animationDelay: `${i*0.18}s`, animationDuration:"0.7s" }}/>
          ))}
        </div>
        <p className="font-hindi text-base font-bold text-yellow-700">खेल तैयार हो रहा है…</p>
        <p className="font-sans text-xs text-gray-400 mt-1">Loading your game…</p>
      </div>
    </div>
  );
}
