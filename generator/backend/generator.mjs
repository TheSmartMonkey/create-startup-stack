import { generators } from '../generators.mjs';
import { serverlessActions } from './actions.mjs';
import { serverlessPrompts } from './prompts.mjs';

export function serverlessGenerator(plop) {
  plop.setGenerator(generators.serverless, {
    prompts: serverlessPrompts(),
    actions: (data) => serverlessActions(data),
  });
}
