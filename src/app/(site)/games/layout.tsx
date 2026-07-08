import { PlayerProvider } from "@/context/PlayerContext";
export default function GamesLayout({children}:{children:React.ReactNode}){
  return <PlayerProvider>{children}</PlayerProvider>;
}
