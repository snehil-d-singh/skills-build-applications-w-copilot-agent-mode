import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';

type Team = { name: string; mascot: string; members: unknown[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const resource = useApiData<TeamsResponse>('/api/teams');
  return <CapabilityCard title="Teams" description="Manage teams and members.">
    {resource.status === 'loading' && <p role="status">Loading teams...</p>}
    {resource.status === 'error' && <p role="alert">Unable to load teams. Please try again.</p>}
    {resource.status === 'success' && (resource.data.teams.length === 0
      ? <p>No teams yet.</p>
      : <ul>{resource.data.teams.map((team) => <li key={team.name}>
        {team.name} ({team.mascot}) — {team.members.length} members
      </li>)}</ul>)}
  </CapabilityCard>;
}
