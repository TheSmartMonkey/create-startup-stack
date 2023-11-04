import { backendGenerator } from './backend/generator.mjs';
import { toKebabCase, toTitleCase } from './helpers.mjs';
import { plopGenerator } from './plop/generator.mjs';

export default (plop) => {
  // Helpers
  plop.setHelper('titlecase', (text) => toTitleCase(text));
  plop.setHelper('kebabcase', (text) => toKebabCase(text));

  // Generators
  backendGenerator(plop);
  plopGenerator(plop);
};
