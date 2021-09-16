import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Cdk from '../lib/cdk-stack';

test('Lambda function Deployed', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Cdk.CdkStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResource("AWS::Lambda::Function",{
      VisibilityTimeout: 300
    }));
});
