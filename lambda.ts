// // exports.universal = (event, context) => awsServerlessExpress.proxy(server, event, context);
//
// const loadData = require("./lib/loadData");
//
// exports.updateTWHouseLatestData = function(event, context) {
//   console.log("updateTWHouseLatestData start");
//   loadData.downloadLatest();
//   console.log("updateTWHouseLatestData end");
//
//     // const fileName = "/tmp/test.txt";
//     // fs.writeFile(fileName, "testing", function (err) {
//     //     if (err) {
//     //         context.fail("writeFile failed: " + err);
//     //     } else {
//     //         context.succeed("writeFile succeeded");
//     //         //read it
//     //           // const houseprice = JSON.parse(fs.readFileSync(fileName, 'utf8'));
//     //         const houseprice = fs.readFileSync(fileName, 'utf8');
//     //         console.log("price:", houseprice);
//     //     }
//     // });
// };

'use strict';

import { Handler, Context, Callback } from 'aws-lambda';

const loadData = require("./lib/loadData");

interface HelloResponse {
  statusCode: number;
  body: string;
}

const updateTWHouseLatestData: Handler = (event: any, context: Context, callback: Callback) => {

  console.log("updateTWHouseLatestData start2");
  loadData.downloadLatest();
  console.log("updateTWHouseLatestData end2");

  const response: HelloResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: Math.floor(Math.random() * 10)
    })
  };

  // callback(undefined, response);
};

export { updateTWHouseLatestData }


// module.exports.hello = (event, context, callback) => {

  // console.log("updateTWHouseLatestData start");
  // loadData.downloadLatest();
  // console.log("updateTWHouseLatestData end");

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
