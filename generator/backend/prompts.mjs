import { backendTempates } from './templates.mjs';

export function serverlessPrompts() {
  return [
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template',
      choices: Object.values(backendTempates),
    },
    {
      when(context) {
        return context.template.includes(backendTempates.endpoint);
      },
      type: 'input',
      name: 'name',
      message: 'Choose a lambda function name',
    },
    {
      when(context) {
        return context.template.includes(backendTempates.handlerTest);
      },
      type: 'input',
      name: 'name',
      message: 'Choose test file name',
    },
    {
      when(context) {
        return context.template.includes(backendTempates.handlerIntegrationTest);
      },
      type: 'input',
      name: 'name',
      message: 'Choose integration test file name',
    },
    {
      when(context) {
        return context.template.includes(backendTempates.apiServiceRouter);
      },
      type: 'input',
      name: 'name',
      message: 'Choose router name',
    },
  ];
}
