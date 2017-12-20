// exports.universal = (event, context) => awsServerlessExpress.proxy(server, event, context);

const loadData = require("./loadData");

exports.updateTWHouseLatestData = function(event, context) {
  console.log("updateTWHouseLatestData start");
  loadData.downloadLatest();
  console.log("updateTWHouseLatestData end");

    // const fileName = "/tmp/test.txt";
    // fs.writeFile(fileName, "testing", function (err) {
    //     if (err) {
    //         context.fail("writeFile failed: " + err);
    //     } else {
    //         context.succeed("writeFile succeeded");
    //         //read it
    //           // const houseprice = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    //         const houseprice = fs.readFileSync(fileName, 'utf8');
    //         console.log("price:", houseprice);
    //     }
    // });
};
