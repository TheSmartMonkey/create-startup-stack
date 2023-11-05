// TODO: Export todoDao
export type Todo = {
  id: string;
  title: string;
  step: number;
};

export type GetTodoById = {
  todoId: Todo['id'];
};

export type CreateTodo = {
  title: Todo['title'];
  step: Todo['step'];
};
