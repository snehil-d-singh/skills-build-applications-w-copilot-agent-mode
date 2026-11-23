import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: true, trim: true },
  focus: { type: String, required: true, trim: true },
  minutes: { type: Number, min: 1, required: true },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], required: true },
});

export const Workout = model('Workout', workoutSchema);
