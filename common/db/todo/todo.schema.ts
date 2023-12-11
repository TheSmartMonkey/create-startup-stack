import { DbTables } from '@db/tables';
import mongoose from 'mongoose';
import { TodoDao } from './todo.dao';

const schema = new mongoose.Schema<TodoDao>(
  {
    title: { type: String, required: true },
    step: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: DbTables.TODO,
  },
);

export const TodoModel = mongoose.model<TodoDao>('TodoModel', schema);
