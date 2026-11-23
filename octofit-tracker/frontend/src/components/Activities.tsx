import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

export default function Activities() {
  const resource = useApiData<ActivitiesResponse>('/api/activities');
  return <CapabilityCard title="Activities" description="Track student activity minutes and points.">
    {resource.status === 'loading' && <p role="status">Loading activities...</p>}
    {resource.status === 'error' && <p role="alert">Unable to load activities. Please try again.</p>}
    {resource.status === 'success' && (resource.data.activities.length === 0
      ? <p>No activities yet.</p>
      : <ul>{resource.data.activities.map((activity, index) => <li key={`${activity.type}-${index}`}>
        {activity.type}: {activity.minutes} minutes, {activity.points} points
      </li>)}</ul>)}
  </CapabilityCard>;
}
