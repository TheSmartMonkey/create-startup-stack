import { backendTempates } from './templates.mjs';

export function serverlessActions(data) {
  console.log(data);
  return [
    ...createLambdaFunctionApiEndpoint(data),
    ...createHandlerTestFile(data),
    ...createHandlerIntegrationTestFile(data),
    ...createApiServiceRouter(data),
  ];
}

function createLambdaFunctionApiEndpoint(data) {
  if (data.template.includes(backendTempates.endpoint)) {
    return [
      {
        type: 'addMany',
        destination: 'src/functions/{{name}}',
        base: `backend/templates/${backendTempates.endpoint}/`,
        templateFiles: `backend/templates/${backendTempates.endpoint}/**/*`,
      },
    ];
  }
  return [];
}

function createHandlerTestFile(data) {
  if (data.template.includes(backendTempates.handlerTest)) {
    return [
      {
        type: 'add',
        path: 'handler.test.ts',
        templateFile: `backend/templates/${backendTempates.handlerTest}/handler.test.ts.hbs`,
      },
    ];
  }
  return [];
}

function createHandlerIntegrationTestFile(data) {
  if (data.template.includes(backendTempates.handlerIntegrationTest)) {
    return [
      {
        type: 'add',
        path: 'handler.integration.test.ts',
        templateFile: `backend/templates/${backendTempates.handlerIntegrationTest}/handler.integration.test.ts.hbs`,
      },
    ];
  }
  return [];
}

function createApiServiceRouter(data) {
  if (data.template.includes(backendTempates.apiServiceRouter)) {
    return [
      {
        type: 'addMany',
        destination: '../backend/api-service/src/api/{{name}}',
        base: `backend/templates/${backendTempates.apiServiceRouter}/`,
        templateFiles: `backend/templates/${backendTempates.apiServiceRouter}/**/*`,
      },
    ];
  }
  return [];
}
