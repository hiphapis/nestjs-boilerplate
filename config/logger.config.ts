import pino from 'pino';
import { Params } from 'nestjs-pino';
import { isLocal } from "./env.helper";

function loggerConfig(): Params {
  let level = 'info';
  let transport = undefined;
  if (isLocal) {
    level = 'trace';
    transport = {
      target: 'pino-pretty',
      options: {
        singleLine: true,
      },
    };
  }
  return {
    pinoHttp: {
      customProps: (_request, _response) => ({ context: 'HTTP' }),
      stream: pino.destination({ sync: false }),
      autoLogging: false,
      formatters: {
        level(level) {
          return { level };
        },
      },
      level,
      transport,
    },
  }
}

export default loggerConfig;
