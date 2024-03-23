import { backendTempates } from './templates.mjs';

export function backendPrompts() {
  return [
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template',
      choices: Object.values(backendTempates),
    },
    {
      when(context) {
        return context.template === backendTempates.API_SERVICE_ROUTER;
      },
      type: 'input',
      name: 'name',
      message: 'Choose router name',
    },
    {
      when(context) {
        return context.template === backendTempates.SERVICE;
      },
      type: 'input',
      name: 'name',
      message: 'Choose service name',
    },
    {
      when(context) {
        return context.template === backendTempates.SERVICE;
      },
      type: 'input',
      name: 'path',
      // TODO: update api-service templates
      message: 'Choose path (ex: api-service/src/api/hello/services)',
    },
  ];
}
