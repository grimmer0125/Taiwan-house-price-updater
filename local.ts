const loadData = require("./lib/loadData");

(() => {
  console.log("updateTWHouseLatestData start1");

  const dataURL =  "http://plvr.land.moi.gov.tw/DownloadHistory?type=history&fileName=20180421"; 
  // loadData.downloadHouseData(dataURL);
  // loadData.load2018S3Zip();
  // 1.b loadData.load20171201ZipToJson();
  loadData.uploadTestDataToFirebase('result.json');

  console.log("updateTWHouseLatestData end");

})();
