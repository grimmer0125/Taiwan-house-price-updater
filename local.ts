const loadData = require('./lib/loadData');

(() => {
  console.log('updateTWHouseLatestData start');
  // testUploadToFirebase();
  loadData.downloadLatest();
  // loadData.handle20171201();
  // loadData.loadSeasonData();
  // loadData.uploadTestDataToFirebase('2012S4-2017S3.json');

  console.log('updateTWHouseLatestData end');


  // require the Twilio module and create a REST client
  // Twilio Credentials
  // const accountSid = 'AC83651bf8e21c30b313a44ccb97db3688';
  // const authToken = 'ee7f411bf34d3424bc8cd4c934193079';
  // // const twilioClient = require('twilio')(accountSid, authToken);
  // //
  // // twilioClient.messages.create({to: '+886963052251', from: '+12016279052', body: 'Line bot has problems !!'}).then((message) => {
  // //   console.log(message.sid);
  // // });
  //
  // var accountSid = 'AC83651bf8e21c30b313a44ccb97db3688';
  // // var authToken = 'your_auth_token';
  //
  // //require the Twilio module and create a REST client
  // var client = require('twilio')(accountSid, authToken);
  //
  // client.messages.create({
  //   to: "+886963052251",
  //   from: "+15017250604",
  //   body: "This is the ship that made the Kessel Run in fourteen parsecs?"
  // }, function(err, message) {
  //   console.log(message.sid);
  // });
  // return;
  // var admin = require("firebase-admin");
  //
  // var serviceAccount = require("./taiwanhouseprice-firebase-adminsdk-semoq-7b5e0677fa.json");
  //
  // admin.initializeApp({credential: admin.credential.cert(serviceAccount), databaseURL: "https://taiwanhouseprice.firebaseio.com"});
  //
  // const defaultDatabase = admin.database();
  //
  // const dataPath = "/houseprice";  + result.uid;

  // defaultDatabase.ref(dataPath).on('value', (snap) => {
  // const houseValue = snap.val();
  // });
  // const dummy = {"2018-01-01":{price:100}};
  // defaultDatabase.ref(dataPath).update(dummy).then(()=>{
  // console.log("save house price ok");
  // });

  // const fileName = "20171201.json";
  // const houseprice = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  // defaultDatabase.ref(dataPath).update(houseprice).then(()=>{
  //   console.log("save house price ok");
  // });
})();
