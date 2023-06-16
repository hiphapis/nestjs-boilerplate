import 'dotenv/config';

import { find, forEach } from 'lodash';
import { getSSMParameters } from 'lib/aws.util';
import {
  ENV_DEV,
  ENV_LOCAL,
  ENV_NEXTWEEK,
  ENV_WWW,
  ENV_WWWTEST,
  TEnv,
} from 'config/constants';

export const isDev: boolean = process.env.NODE_ENV.toUpperCase() == ENV_DEV;
export const isNextWeek: boolean = process.env.NODE_ENV.toUpperCase() == ENV_NEXTWEEK;
export const isWWWTest: boolean = process.env.NODE_ENV.toUpperCase() == ENV_WWWTEST;
export const isWWW: boolean = process.env.NODE_ENV.toUpperCase() == ENV_WWW;
export const isLocal: boolean = process.env.NODE_ENV.toUpperCase() == ENV_LOCAL;
export const isServer: boolean = isDev || isNextWeek || isWWWTest || isWWW;

export type TPSMap = {
  [key: string]: string;
};

async function loadEnvsFromPS(env: TEnv, map: TPSMap) {
  if (isLocal) {
    return;
  }

  const variables: any = {};

  const namespace = `/SNS_NEST_API/${env}`;
  const parameters = await getSSMParameters(namespace);

  forEach(map, (path, name) => {
    const matched = find(parameters, { Name: `${namespace}/${path}` });
    if (matched) {
      variables[name] = matched.Value;
    }
  });

  return variables;
}

export default loadEnvsFromPS;
