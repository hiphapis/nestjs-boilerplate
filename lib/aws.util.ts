import { SSM } from '@aws-sdk/client-ssm';

const region = process.env.AWS_REGION || 'ap-northeast-2';
const ssm = new SSM({ region });

export async function getSSMParameters(path, parameters = [], nextToken = '') {
  return await ssm
    .getParametersByPath({
      Path: path,
      Recursive: true,
      WithDecryption: true,
      NextToken: nextToken,
      MaxResults: 10,
    })
    .then(({ Parameters, NextToken }) => {
      const newParameters = parameters.concat(Parameters);
      return NextToken
        ? getSSMParameters(path, newParameters, NextToken)
        : newParameters;
    });
}
