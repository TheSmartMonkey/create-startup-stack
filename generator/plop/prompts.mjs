import { plopTempates } from './templates.mjs';

export function plopPrompts() {
  return [
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template',
      choices: Object.values(plopTempates),
    },
    {
      when(context) {
        return context.template === plopTempates.PLOP_GENERATOR;
      },
      type: 'input',
      name: 'name',
      message: 'New plop generator name',
    },
  ];
}
