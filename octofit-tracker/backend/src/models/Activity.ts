import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, enum: ['run', 'cycle', 'strength', 'walk', 'swim', 'yoga'], required: true },
  minutes: { type: Number, min: 1, required: true },
  points: { type: Number, min: 0, required: true },
  occurredAt: { type: Date, required: true },
});

export const Activity = model('Activity', activitySchema);
