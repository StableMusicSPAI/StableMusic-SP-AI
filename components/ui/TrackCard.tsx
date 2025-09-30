export default function TrackCard({ track }) {
  return (
    <div className="p-4 bg-gray-900 rounded-2xl shadow-md hover:scale-105 transition">
      <img src={track.coverUrl} alt={track.title} className="rounded-lg mb-2" />
      <h3 className="font-semibold">{track.title}</h3>
      <p className="text-sm text-gray-400">{track.artist}</p>
    </div>
  );
}