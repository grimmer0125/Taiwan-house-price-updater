const loadData = require("./lib/loadData");

(() => {
  console.log("updateTWHouseLatestData start");
  // testUploadToFirebase();
  loadData.downloadLatest();
  // loadData.handle20171201();
  // loadData.loadSeasonData();
  // loadData.uploadTestDataToFirebase('2012S4-2017S3.json');

  console.log("updateTWHouseLatestData end");

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
