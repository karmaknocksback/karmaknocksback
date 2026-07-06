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

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  "snakes-ladders": KarmaSnakesLadders,
  "memory-quest": NavkarMemoryQuest,
  "daily-karma": DailyKarmaGame,
  "tiny-rescue": TinyLifeRescue,
  "karma-garden": KarmaGarden,
  "karma-forest": KarmaForest,
  "temptation-run": TemptationRun,
  "temple-builder": TempleBuilder,
  "jain-stories": JainStoryAdventures,
  "aparigraha": AparigrahaAdventure,
  "compassion-city": CompassionCity,
  "karma-ludo": KarmaLudo,
};

export default async function GamePage({ params }: Props) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game || !game.available) notFound();
  const GameComponent = GAME_COMPONENTS[gameId];
  if (!GameComponent) notFound();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#050012 0%,#0a0025 100%)" }}>
      <div className="pt-6 pb-2 px-5 text-center">
        <Link href="/games"
          className="inline-flex items-center gap-2 font-sans text-xs rounded-full px-4 py-1.5 mb-4"
          style={{ color:"rgba(255,215,0,0.6)",border:"1px solid rgba(255,215,0,0.2)",background:"rgba(255,215,0,0.06)" }}>
          ← Back to Karma Kids World
        </Link>
        <div className="text-3xl mb-1">{game.emoji}</div>
        <h1 className="font-display-hi text-2xl mb-0.5" style={{ color: game.color }}>{game.titleHi}</h1>
        <p className="font-sans text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>{game.title} · Ages {game.age}</p>
      </div>
      <GameComponent />
    </div>
  );
}
