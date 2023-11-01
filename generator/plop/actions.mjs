export function plopActions(data) {
  console.log(data);
  return [...plopGenerator()];
}

function plopGenerator() {
  return [
    {
      type: 'add',
      path: '{{name}}/templates/exemple.ts.hbs',
    },
    {
      type: 'addMany',
      destination: '{{name}}',
      base: `plop/templates/`,
      templateFiles: `plop/templates/**/*`,
    },
  ];
}
