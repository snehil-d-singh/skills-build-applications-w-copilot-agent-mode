import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: Entry[] };

export default function Leaderboard() {
  const resource = useApiData<LeaderboardResponse>('/api/leaderboard');
  return <CapabilityCard title="Leaderboard" description="Compare team point totals.">
    {resource.status === 'loading' && <p role="status">Loading leaderboard...</p>}
    {resource.status === 'error' && <p role="alert">Unable to load leaderboard. Please try again.</p>}
    {resource.status === 'success' && (resource.data.leaderboard.length === 0
      ? <p>No leaderboard rankings yet.</p>
      : <ol>{resource.data.leaderboard.map((entry) => <li key={entry.teamName}>
        {entry.teamName}: {entry.totalPoints} points
      </li>)}</ol>)}
  </CapabilityCard>;
}
