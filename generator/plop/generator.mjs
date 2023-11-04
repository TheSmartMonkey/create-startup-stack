import { generators } from '../generators.mjs';
import { createPlopGenerator } from './actions/plop.mjs';
import { plopPrompts } from './prompts.mjs';

export function plopGenerator(plop) {
  plop.setGenerator(generators.PLOP, {
    prompts: plopPrompts(),
    actions: (data) => plopActions(data),
  });
}

function plopActions(data) {
  console.log(data);
  return [...createPlopGenerator(data)];
}
