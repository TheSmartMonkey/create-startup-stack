export type TodoDao = {
  id: string;
  title: string;
  step: number;
};

export type GetTodoByIdDao = {
  todoId: TodoDao['id'];
};

export type CreateTodoDao = {
  title: TodoDao['title'];
  step: TodoDao['step'];
};
