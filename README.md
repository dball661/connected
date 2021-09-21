# connected - Vanity Number Generator

As a forward, and in the interest of transparency, in my research for this project I eventually came across an existing project on github https://github.com/jcconklin/vanity-number-app

As a software developer I believe the ability to adapt and iterate on existing implementations is key. Good code is readable and reusable; the above project had a number of components that I was able to adapt & hopefully improve and optimize given my own experiences. No reason to completely reinvent the wheel in this instance. 


This app is built using the AWS CDK to generate & deploy the AWS Lambda & AWS Dynamodb cloud resources underpinning the AWS Connect Contact Flow that orchestrates the customers experience from first contact via the phone. The number for this instance is 213-347-9347, though this project is designed to be easily deployed within your own AWS account and will integrate seemlessly with existing COnnect instances. The Lambda looks at the number and breaks it down into the numberpad alphabetical represetations of the numbers using a dialpad Map. It then cycles through every possible permutation of words that can be created from this recursively. Checking it against a word dictionary based on SCOWL (Spell Checker Oriented Word Lists), if a valid word has been created it adds it to the list of vanity words for that number.


# Install Libraries

in the main directory run

```bash
 npm run dependencies
```

to install all the dependencies for the cdk as well as the lambda runtime





Given more time, for a production system, I would have configured autoscaling, point in time recovery & more fine grained action based permissions for the dynamo db table. I would have also created a timestamp key to act as a sort key for the table. 
