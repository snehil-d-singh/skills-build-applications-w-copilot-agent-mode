import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason: string };
type WorkoutsResponse = { suggestions: Workout[] };

export default function Workouts() {
  const resource = useApiData<WorkoutsResponse>('/api/workouts/suggestions/mona%40example.com');
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
    {resource.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
    {resource.status === 'error' && <p role="alert">Unable to load workout suggestions. Please try again.</p>}
    {resource.status === 'success' && (resource.data.suggestions.length === 0
      ? <p>No workout suggestions available.</p>
      : <ul>{resource.data.suggestions.map((workout) => <li key={workout.title}>
        <strong>{workout.title}</strong> — {workout.focus}, {workout.minutes} minutes ({workout.difficulty}). {workout.reason}
      </li>)}</ul>)}
  </CapabilityCard>;
}
