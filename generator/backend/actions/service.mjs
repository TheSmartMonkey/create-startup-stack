import { backendTempates } from '../templates.mjs';

export function createService(data) {
  if (data.template === backendTempates.SERVICE) {
    return [
      {
        type: 'addMany',
        destination: '../backend/{{path}}/{{name}}',
        base: `backend/templates/${backendTempates.SERVICE}/`,
        templateFiles: `backend/templates/${backendTempates.SERVICE}/**/*`,
      },
    ];
  }
  return [];
}
