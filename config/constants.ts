// environment
export const ENV_LOCAL = 'LOCAL';
export const ENV_DEV = 'DEV';
export const ENV_NEXTWEEK = 'NEXTWEEK';
export const ENV_WWWTEST = 'WWWTEST';
export const ENV_WWW = 'WWW';
export type TEnv =
  | typeof ENV_LOCAL
  | typeof ENV_DEV
  | typeof ENV_NEXTWEEK
  | typeof ENV_WWWTEST
  | typeof ENV_WWW;
