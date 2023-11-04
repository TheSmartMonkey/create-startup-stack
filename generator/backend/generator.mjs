import { generators } from '../generators.mjs';
import { createApiServiceRouter } from './actions/api-service-router.mjs';
import { createService } from './actions/service.mjs';
import { backendPrompts } from './prompts.mjs';

export function backendGenerator(plop) {
  plop.setGenerator(generators.BACKEND, {
    prompts: backendPrompts(),
    actions: (data) => backendActions(data),
  });
}

function backendActions(data) {
  console.log(data);
  return [...createApiServiceRouter(data), ...createService(data)];
}
