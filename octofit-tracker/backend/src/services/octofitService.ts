import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError('Activity details are required', 400);
  const { userId, teamId, type, minutes: rawMinutes } = input;
  if (typeof userId !== 'string' || !mongoose.isObjectIdOrHexString(userId)
    || typeof teamId !== 'string' || !mongoose.isObjectIdOrHexString(teamId)) {
    throw httpError('Valid userId and teamId are required', 400);
  }
  const minutes = rawMinutes;
  const activityTypes = ['run', 'cycle', 'strength', 'walk', 'swim', 'yoga'];
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1
    || typeof type !== 'string' || !activityTypes.includes(type.trim().toLowerCase())) {
    throw httpError('A valid activity type and positive minutes are required', 400);
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw httpError('User or team was not found', 404);
  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim().toLowerCase(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input) || typeof input.name !== 'string' || !input.name.trim()) {
    throw httpError('A team name is required', 400);
  }
  if (typeof input.mascot !== 'string' || !input.mascot.trim()) {
    throw httpError('A team mascot is required', 400);
  }
  const members = input.members ?? [];
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !mongoose.isObjectIdOrHexString(member))) {
    throw httpError('Members must be valid user IDs', 400);
  }
  const uniqueMembers = [...new Set(members)];
  if (uniqueMembers.length && await User.countDocuments({ _id: { $in: uniqueMembers } }) !== uniqueMembers.length) {
    throw httpError('One or more users were not found', 404);
  }
  const team = await Team.create({ name: input.name.trim(), mascot: input.mascot.trim(), members: uniqueMembers });
  if (uniqueMembers.length) {
    await Team.updateMany(
      { _id: { $ne: team._id }, members: { $in: uniqueMembers } },
      { $pull: { members: { $in: uniqueMembers } } },
    );
    await User.updateMany({ _id: { $in: uniqueMembers } }, { $set: { team: team._id } });
  }
  return team;
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: string; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError('User was not found', 404);

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = {
    cycle: 'endurance',
    run: 'endurance',
    strength: 'strength',
    swim: 'endurance',
    walk: 'endurance',
    yoga: 'mobility',
  };
  let focus = user.fitnessGoal || (recentActivity ? activityFocus[recentActivity.type] : undefined);
  if (!focus) return [];

  let workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  if (workouts.length === 0 && recentActivity && activityFocus[recentActivity.type] !== focus) {
    focus = activityFocus[recentActivity.type];
    workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  }
  const reason = focus === user.fitnessGoal
    ? `Recommended to support your ${user.fitnessGoal} fitness goal.`
    : `Recommended based on your recent ${recentActivity?.type} activity.`;
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
