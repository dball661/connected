import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'connected', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda/built'),  // code loaded from "lambda" directory, then complied to ts from js and sent to the built dir
      handler: 'connect.lambdaHandler'                // file is "connect", function is "lambdaHandler"
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: lambdaFunction
    });

  }
}
