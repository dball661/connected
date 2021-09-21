import {
  ConnectContactFlowEvent,
  ConnectContactFlowResult,
  ConnectContactFlowCallback,
  Context,
} from "aws-lambda";
import * as AWS from "aws-sdk";
const words = require("an-array-of-english-words");

export const lambdaHandler = async (
  event: ConnectContactFlowEvent,
  context: Context,
  callback: ConnectContactFlowCallback
): Promise<ConnectContactFlowResult> => {
  AWS.config.update({ region: process.env.region });
  const dynamoClient = new AWS.DynamoDB.DocumentClient();

  try {
    var { customerNumber } = event.Details.Parameters; // grab the customerNumber attribute passed through from the contact flow
    const validNumber = validateNumber(customerNumber); // use some Regex magic to ensure that it is a valid 10 digit number sans country code

    const vanityList = await generateVanityNumbers(
      validNumber,
      dynamoClient,
      words
    );

    const result: ConnectContactFlowResult = {};

    const finalVanityList = vanityList.slice(-3); // taking the last three (or fewer) elements of the array to return to Connect

    for (let i = 0; i < finalVanityList.length; i++) {
      result["number" + i] = finalVanityList[i].replace(/(.)/g, "$&, ");
    }

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * validates phone number
 * @param phone
 */
const validateNumber = (number: string): string => {
  // This expression matches valid, ten digit US phone numbers
  const validPhoneNumber = /^(\+1|1)?(\d{10})$/;

  if (!number) {
    throw Error("Phone number was null or undefined.");
  }

  if (!number.match(validPhoneNumber)) {
    throw Error("Invalid phone number.");
  }

  return number.replace(validPhoneNumber, "$2");
};

const generateVanityNumbers = async (
  number: string,
  dynamoClient: AWS.DynamoDB.DocumentClient,
  words: string[]
): Promise<string[]> => {
  let vanityList: string[] = await checkNumber(number, dynamoClient);
  if (vanityList) {
    //if the vanityList is already in the database, return it
    return vanityList;
  }

  vanityList = [];

  const dialPadMap = new Map([
    ["0", "0"],
    ["1", "1"],
    ["2", "ABC"],
    ["3", "DEF"],
    ["4", "GHI"],
    ["5", "JKL"],
    ["6", "MNO"],
    ["7", "PQRS"],
    ["8", "TUV"],
    ["9", "WXYZ"],
  ]);

  const firstSix: string = number.slice(0, 6);
  const lastFour = number.slice(6).split("");

  const spotOneStr = dialPadMap.get(lastFour[0]).split("");
  const spotTwoStr = dialPadMap.get(lastFour[1]).split("");
  const spotThreeStr = dialPadMap.get(lastFour[2]).split("");
  const spotFourStr = dialPadMap.get(lastFour[3]).split("");

  //create a map data structure that maps integer phone pad digits to their alphabetical counterparts

  for (let i = 0; i < spotOneStr.length; i++) {
    if (vanityList.length >= 10) {
      // list already contains 5 words
      break;
    }

    for (let j = 0; j < spotTwoStr.length; j++) {
      if (vanityList.length >= 10) {
        // list already contains 5 words
        break;
      }

      for (let k = 0; k < spotThreeStr.length; k++) {
        if (vanityList.length >= 10) {
          // list already contains 5 words
          break;
        }

        for (let m = 0; m < spotFourStr.length; m++) {
          if (vanityList.length >= 10) {
            // list already contains 5 words
            break;
          }

          const phoneWord =
            spotOneStr[i] + spotTwoStr[j] + spotThreeStr[k] + spotFourStr[m];
          const vanityNumber = firstSix + phoneWord;
          if (vanityList.length < 5) {
            // take the first 5 permutations (or fewer if lastFour is e.g. 1111)
            vanityList.push(vanityNumber);
          } else if (words.includes(phoneWord.toLowerCase())) {
            // will add up to the first five matches in the dictionary
            vanityList.push(vanityNumber);
          }
        }
      }
    }
  }

  vanityList = vanityList.slice(-5); //only consider the last 5 (or fewer) elements added

  await save(number, vanityList, dynamoClient).catch((error) => {
    throw new Error(error);
  });

  return vanityList;
};

const checkNumber = async (
  number: string,
  dynamoClient: AWS.DynamoDB.DocumentClient
): Promise<string[]> => {
  const partitionKey = process.env.PARTITION_KEY;
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      [partitionKey]: number,
    },
  };

  const result = await dynamoClient.get(params).promise();

  try {
    console.log("Found vanity numbers in db: " + result.Item["vanity_numbers"]);
    return result.Item["vanity_numbers"];
  } catch (err) {
    return null; //returns null if no vanity_numbers attribute exists
  }
};

const save = async (
  number: string,
  vanityList: string[],
  dynamoClient: AWS.DynamoDB.DocumentClient
) => {
  const partitionKey = process.env.PARTITION_KEY;
  const params: any = {
    TableName: process.env.TABLE_NAME,
    Item: {
      [partitionKey]: number,
      vanity_numbers: vanityList,
    },
    ConditionExpression: "attribute_not_exists(phone_number)", // do not overwrite existing entries, but shouldn't trigger since checkNumber() handles this
    ReturnConsumedCapacity: "TOTAL",
  };

  await dynamoClient.put(params).promise();
};
