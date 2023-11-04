import { backendTempates } from '../templates.mjs';

export function createApiServiceRouter(data) {
  if (data.template === backendTempates.API_SERVICE_ROUTER) {
    return [
      {
        type: 'addMany',
        destination: '../backend/api-service/src/api/{{name}}',
        base: `backend/templates/${backendTempates.API_SERVICE_ROUTER}/`,
        templateFiles: `backend/templates/${backendTempates.API_SERVICE_ROUTER}/**/*`,
      },
    ];
  }
  return [];
}
