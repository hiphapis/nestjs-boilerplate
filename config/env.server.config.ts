import { registerAs } from '@nestjs/config';
import { merge } from 'lodash';
import { ENV_LOCAL } from './constants';
import loadEnvsFromPS, { TPSMap } from './env.helper';

export default registerAs('server', async () => {
  const env: any = {};

  env.NODE_ENV = (process.env.NODE_ENV || ENV_LOCAL).toUpperCase();
  env.isLocal = env.NODE_ENV == ENV_LOCAL;

  env.PORT = +process.env.PORT || 3000;

  // TODO: Parameter Store 연동하면 Map 만들어서 적용
  const psMap: TPSMap = {
    DATABASE_HOST: 'DB/HOST',
    DATABASE_PORT: 'DB/PORT',
  };
  const envsFromPS = await loadEnvsFromPS(env.NODE_ENV, psMap);

  return merge(env, envsFromPS);
});
