import { plopTempates } from '../templates.mjs';

export function createPlopGenerator(data) {
  if (data.template === plopTempates.PLOP_GENERATOR) {
    return [
      {
        type: 'addMany',
        destination: '{{name}}',
        base: `plop/templates/${plopTempates.PLOP_GENERATOR}/`,
        templateFiles: `plop/templates/${plopTempates.PLOP_GENERATOR}/**/*`,
      },
    ];
  }
  return [];
}
