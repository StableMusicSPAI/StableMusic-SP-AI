import Player from "../components/Player";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">StableMusic SP AI</h1>
      <Player trackKey="demo.mp3" />
    </main>
  );
}