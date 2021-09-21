import * as cdk from "@aws-cdk/core";
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda";
import { LambdaRestApi } from "@aws-cdk/aws-apigateway";
import { AttributeType, Table } from "@aws-cdk/aws-dynamodb";
export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoTable = new Table(this, id, {
      partitionKey: {
        name: "phone_number",
        type: AttributeType.STRING,
      },
      tableName: "vanityNumbers",

      /**
       *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, to help with cleanup of this project I have set the removalpolicy to destroy
       */
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    const lambdaFunction = new Function(this, "connected", {
      runtime: Runtime.NODEJS_14_X, // execution environment
      code: Code.fromAsset("lambda/built"), // code loaded from "lambda" directory, then complied to ts from js and sent to the built dir
      handler: "connect.lambdaHandler", // file is "connect", function is "lambdaHandler"
      memorySize: 2048,
      timeout: cdk.Duration.seconds(8),
      environment: {
        region: cdk.Stack.of(this).region,
        PARTITION_KEY: "phone_number",
        TABLE_NAME: dynamoTable.tableName,
      }, // env variables that will be referenced in the lambda runtime to access the correct table
    });

    dynamoTable.grantReadWriteData(lambdaFunction); // grant the lambda access to our dynamodb table

    new LambdaRestApi(this, "EndPoint", {
      //level 3 construct that is an abstraction of common resource use cases, in this case an apigateway that acts as a request proxy for a lambda function.
      handler: lambdaFunction,
    });

    const arn = lambdaFunction.functionArn;

    new cdk.CfnOutput(this, "Output", {
      value: arn,
      description: "The arn of the lambda function",
    });
  }
}
