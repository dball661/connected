import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult 
} from "aws-lambda";
export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("event ", event)
  const queries = JSON.stringify(event.queryStringParameters);
  return {
    statusCode: 200,
    body: `Queries: ${queries}`
  }
}