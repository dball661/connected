# Connected - Vanity Number Generator

As a forward, and in the interest of transparency, in my research for this project I eventually came across an existing project on github https://github.com/jcconklin/vanity-number-app

As a software developer I believe the ability to adapt and iterate on existing implementations is key. Good code is readable and reusable; the above project had a number of components that I was able to adapt & hopefully improve and optimize given my own experiences. No reason to completely reinvent the wheel in this instance.

This app is built using the AWS CDK to generate & deploy the AWS Lambda & AWS Dynamodb cloud resources underpinning the AWS Connect Contact Flow that orchestrates the customers experience from first contact via the phone. The number for this instance is 213-347-9347, though this project is designed to be easily deployed within your own AWS account and will integrate seemlessly with existing Connect instances. The Lambda looks at the number and breaks it down into the numberpad alphabetical represetations of the numbers using a dialpad Map. It then cycles through possible words that can be created from this. Checking it against a word dictionary based on SCOWL (Spell Checker Oriented Word Lists), if a valid word has been created it adds it to the list of vanity words for that number. It then adds the 5 best results to the dynamodb table under the phone_number primary key. If there is already an instance in the table for that number, it will return the 3 best results as opposed to regenerating the vanity words. The flow then reads the 3 numbers out to the caller.

# Install Libraries

You will need to ensure you have the AWS CLI installed, and your access code and secret access input in your config file. if you have a specific profile beyond default you can add this to the end of the cdk-deploy script in the main CDK directories package.json, --profile {your profile name here}

Node.js of a version past 10.13 will also be needed to run the CDK lib thats gets installed in that directory.

More concise instructions can be found here for your reference https://docs.aws.amazon.com/cdk/latest/guide/work-with.html

Before you can utilize the CDK to deploy your resources, it will first need to be bootstrapped
run the following command in the main CDK dir

```bash
cdk bootstrap
```

This should only need to be done once

in the main directory run

```bash
 npm run dependencies
```

to install all the dependencies for the cdk, compile the ts to the build directory, & download the lambda runtime dependencies

# Synth

run the following command to do a diff and synthesize the Cloudformation template

```bash
 npm run cdk-synth
```

# Deploy

run the following command to deploy your stack to your AWS account

```bash
 npm run cdk-deploy
```

Once this has been run in your command line there will be an Output section, with CdkStack.Output as one of the outputs. This is the ARN of the lambda function you created. to add this to your existing AWS Connect instace, log into it and click on contact flows option on the left. Under the AWS labda sub-header select the ARN from the output and select Add Lambda Function. There is a file called flow in the main CDK dir, in here you will need to replace line 115's value key with the ARN that was output from the CDK deploy command, in the same way as above to add that function to your instance. Then you will log into your actual instance, and select Contact Flows under the routing dropdown. Click create new flow, then under the dropdown next to the save button click import flow. Once you save and publish this flow, you should be able to add it as the default contact flow for one of the phone numbers under the phone number subheading in the routing dropdown

## Architecture diagram

the [Architecture Diagram](https://app.cloudcraft.co/view/af86b3de-61e7-4c9c-8518-38cc43b872b2?key=rxaHGwuRq2a4w6mZwjVGlQ) for this project was generated using a website called [Cloudcraft](https://app.cloudcraft.co/)

It can also be used with this diagram to easily get a quick estimate on the infrastructure costs associated with this project

# Thoughts

Given more time, for a production system, I would have configured autoscaling, point in time recovery & more fine grained action based permissions for the dynamo db table. I would have created a timestamp key to act as a sort key for the table

The algorithm to generate the vanity words could be expanded and optimized, though I tested recursion and it did not seem to be any more readable or performant. Taking inputs for the length of the number they want vanitized would be one way to go

The word list it checks against could also be modified to only include words of a length that will only be considered for optimization purposes

I would have expanded heavily on unit tests for the actual lambda/business logic

I would also have generated a basic website that users could have also utilized to see their vanity numbers
