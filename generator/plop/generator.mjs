import { generators } from '../generators.mjs';
import { plopActions } from './actions.mjs';
import { plopPrompts } from './prompts.mjs';

export function plopGenerator(plop) {
  plop.setGenerator(generators.plop, {
    prompts: plopPrompts(),
    actions: (data) => plopActions(data),
  });
}
