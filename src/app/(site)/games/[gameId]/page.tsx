import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame } from "@/components/games/game-registry";
import KarmaSnakesLadders from "@/components/games/KarmaSnakesLadders";
import NavkarMemoryQuest from "@/components/games/NavkarMemoryQuest";
import DailyKarmaGame from "@/components/games/DailyKarmaGame";
import TinyLifeRescue from "@/components/games/TinyLifeRescue";
import KarmaGarden from "@/components/games/KarmaGarden";
import KarmaForest from "@/components/games/KarmaForest";
import TemptationRun from "@/components/games/TemptationRun";
import TempleBuilder from "@/components/games/TempleBuilder";
import JainStoryAdventures from "@/components/games/JainStoryAdventures";
import AparigrahaAdventure from "@/components/games/AparigrahaAdventure";
import CompassionCity from "@/components/games/CompassionCity";
import KarmaLudo from "@/components/games/KarmaLudo";

export const dynamic = "force-dynamic";
interface Props { params: Promise<{ gameId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const g = getGame(gameId);
  if (!g) return { title: "Game Not Found" };
  return { title: `${g.titleHi} | ${g.title} — Karma Kids World`, description: g.desc };
}

const GAME_BG: Record<string,string> = {
  "snakes-ladders": "linear-gradient(160deg,#F1F8E9,#DCEDC8,#C8E6C9)",
  "memory-quest":   "linear-gradient(160deg,#F3E5F5,#E1BEE7,#F8BBD9)",
  "daily-karma":    "linear-gradient(160deg,#FFF3E0,#FFE0B2,#FFCCBC)",
  "tiny-rescue":    "linear-gradient(160deg,#E0F7FA,#B2EBF2,#E0F2F1)",
  "karma-garden":   "linear-gradient(160deg,#FCE4EC,#F8BBD9,#FFF9C4)",
  "karma-forest":   "linear-gradient(160deg,#E8F5E9,#DCEDC8,#F1F8E9)",
  "temptation-run": "linear-gradient(160deg,#FFF8E1,#FFECB3,#FFE0B2)",
  "temple-builder": "linear-gradient(160deg,#FFFDE7,#FFF9C4,#FFF3E0)",
  "jain-stories":   "linear-gradient(160deg,#FFF3E0,#FCE4EC,#E8EAF6)",
  "aparigraha":     "linear-gradient(160deg,#EFEBE9,#D7CCC8,#FFF8E1)",
  "compassion-city":"linear-gradient(160deg,#E3F2FD,#BBDEFB,#E8EAF6)",
  "karma-ludo":     "linear-gradient(160deg,#EDE7F6,#D1C4E9,#FCE4EC)",
};

const GAME_TEXT: Record<string,string> = {
  "snakes-ladders":"#1B5E20","memory-quest":"#4A148C","daily-karma":"#E65100",
  "tiny-rescue":"#006064","karma-garden":"#880E4F","karma-forest":"#1B5E20",
  "temptation-run":"#E65100","temple-builder":"#4E342E","jain-stories":"#BF360C",
  "aparigraha":"#3E2723","compassion-city":"#0D47A1","karma-ludo":"#311B92",
};

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  "snakes-ladders": KarmaSnakesLadders,
  "memory-quest":   NavkarMemoryQuest,
  "daily-karma":    DailyKarmaGame,
  "tiny-rescue":    TinyLifeRescue,
  "karma-garden":   KarmaGarden,
  "karma-forest":   KarmaForest,
  "temptation-run": TemptationRun,
  "temple-builder": TempleBuilder,
  "jain-stories":   JainStoryAdventures,
  "aparigraha":     AparigrahaAdventure,
  "compassion-city":CompassionCity,
  "karma-ludo":     KarmaLudo,
};

export default async function GamePage({ params }: Props) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game || !game.available) notFound();
  const GameComponent = GAME_COMPONENTS[gameId];
  if (!GameComponent) notFound();

  const bg = GAME_BG[gameId] || "linear-gradient(160deg,#FFF9C4,#E1F5FE)";
  const textColor = GAME_TEXT[gameId] || "#333";

  return (
    <div className="min-h-screen" style={{ background:bg }}>
      {/* Header */}
      <div className="pt-6 pb-3 px-5 text-center">
        <Link href="/games"
          className="inline-flex items-center gap-2 font-sans text-xs font-bold rounded-full px-4 py-1.5 mb-4"
          style={{ background:"white", color:textColor, boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
          ← Back to Games
        </Link>
        <div className="text-4xl mb-1" style={{ filter:`drop-shadow(0 4px 8px rgba(0,0,0,0.15))` }}>
          {game.emoji}
        </div>
        <h1 className="font-display-hi text-2xl font-black mb-0.5" style={{ color:textColor }}>
          {game.titleHi}
        </h1>
        <p className="font-sans text-xs font-bold" style={{ color:textColor, opacity:0.55 }}>
          {game.title} · Ages {game.age}
        </p>
      </div>
      <GameComponent />
    </div>
  );
}
