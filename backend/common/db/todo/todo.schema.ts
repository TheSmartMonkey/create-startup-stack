import { DbCollectionNames } from 'collections';
import mongoose from 'mongoose';
import { TodoDao } from './todo.dao';

const schema = new mongoose.Schema<TodoDao>(
  {
    title: { type: String, required: true },
    step: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: DbCollectionNames.TODO,
  },
);

export const TodoModel = mongoose.model<TodoDao>('TodoModel', schema);
