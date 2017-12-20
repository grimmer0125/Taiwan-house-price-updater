'use strict';

import { Handler, Context, Callback } from 'aws-lambda';

const loadData = require("./loadData");

interface HelloResponse {
  statusCode: number;
  body: string;
}

const hello: Handler = (event: any, context: Context, callback: Callback) => {

  console.log("updateTWHouseLatestData start");
  loadData.downloadLatest();
  console.log("updateTWHouseLatestData end");

  const response: HelloResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: Math.floor(Math.random() * 10)
    })
  };

  callback(undefined, response);
};

export { hello }


// module.exports.hello = (event, context, callback) => {

  console.log("updateTWHouseLatestData start");
  loadData.downloadLatest();
  console.log("updateTWHouseLatestData end");

//   const response = {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Go Serverless v1.0! Your function executed successfully!',
//       input: event,
//     }),
//   };
//
//   callback(null, response);
//
//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
// };
