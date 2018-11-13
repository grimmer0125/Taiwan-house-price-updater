import * as fs from "fs";
import serviceAccount from "../taiwanhouseprice-firebase-adminsdk";
const admin = require("firebase-admin");

// import {parseHouseCSV} from './parser.js';
const parser = require("./parser");
const AdmZip = require("adm-zip");
const iconv = require("iconv-lite");

// other famous modules are request, request-progress, request-promise
// https://stackoverflow.com/a/36348693/7354486
const http = require("http");

function uploadToFirebase(houseprice, dataPath = "/houseprice") {
  // const fileName = "20171201.json";
  // const houseprice = JSON.parse(fs.readFileSync(fileName, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://taiwanhouseprice.firebaseio.com"
  });
  const defaultDatabase = admin.database();

  defaultDatabase
    .ref(dataPath)
    .update(houseprice)
    .then(() => {
      console.log("upload house price to firebase ok");

      // defaultDatabase.goOffline(); //<-put here will not terminate
      // so use app().delete();
      admin.app().delete();
    });
  // defaultDatabase.goOffline(); //<-put here will terminate earily
}

function uploadTestDataToFirebase(fileName) {
  // const fileName = "20171201.json";
  const houseprice = JSON.parse(fs.readFileSync(fileName, "utf8"));
  // uploadToFirebase(houseprice, "/houseprice-test")
  uploadToFirebase(houseprice);
}

function downloadHouseData(specificURL = "", saveMode = false) {
  const fileName = "lvr_landcsv";
  const fullFileName = `${fileName}.zip`;

  const dataURL = specificURL
    ? specificURL
    : `http://plvr.land.moi.gov.tw//Download?type=zip&fileName=${fullFileName}`;
  const request = http.get(dataURL, response => {
    console.log("download ok!");
    const file = fs.createWriteStream(`/tmp/${fullFileName}`);
    response.pipe(file);
    // https://stackoverflow.com/a/45007624/7354486
    file.on("finish", () => {
      console.log("save file ok!!");

      // https://stackoverflow.com/a/17676794/7354486 mentions it needs .close
      // file.close(() => {
      // but https://stackoverflow.com/a/45007624/7354486 mentions the new node.js does not need close
      console.log("close the file ok");

      const zipFilePath = `/tmp/${fullFileName}`; // dirs + fileName +".zip";
      const uncompressedPath = `${"/tmp/" + "out/"}${fileName}`;
      loadAndParse(true, zipFilePath, uncompressedPath, result => {
        console.log("load and parse result ok:");
        console.log("next step is to upload to firebase or save it");

        if (!saveMode) {
          uploadToFirebase(result);
        } else {
          fs.writeFile("latest.json", JSON.stringify(result, null, 2), err => {
            if (err) {
              return console.log(err);
            }

            console.log("The file was saved!");
            process.exit();
          });
        }
      });
    });
  });
}

// this url is not valid anymore
// const dataURL = "http://data.moi.gov.tw/MoiOD/System/DownloadFile.aspx?DATA=F0199ED0-184A-40D5-9506-95138F54159A";
function load20171201ZipToJson() {
  const fileName = "1061201";
  const fullFileName = `${fileName}.zip`;

  const zipFilePath = fullFileName;
  const uncompressedPath = `out/${fileName}`;
  loadAndParse(true, zipFilePath, uncompressedPath, result => {
    console.log("result:", result);

    fs.writeFile("20171201.json", JSON.stringify(result, null, 2), err => {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  });
}

function load2012_2017Zip() {
  const totalFileList = [
    "2017S3",
    "2017S2",
    "2017S1",
    "2016S4",
    "2016S3",
    "2016S2",
    "2016S1",
    "2015S4",
    "2015S3",
    "2015S2",
    "2015S1",
    "2014S4",
    "2014S3",
    "2014S2",
    "2014S1",
    "2013S4",
    "2013S3",
    "2013S2",
    "2013S1",
    "2012S4"
  ];
  loadArchiveZipToJson(totalFileList);
}

function load2018S3Zip() {
  const totalFileList = ["2018S3"];
  loadArchiveZipToJson(totalFileList);
}

function loadArchiveZipToJson(totalFileList) {
  const dirs = "season-data/";

  const resultFilePath = "result.json";

  const num_seaons = totalFileList.length;

  const aggregated_result = {};

  for (const fileName of totalFileList) {
    const zipFilePath = `${dirs + fileName}.zip`;
    const uncompressedPath = `out/${fileName}`;

    loadAndParse(false, zipFilePath, uncompressedPath, result => {
      if (result) {
        let date = "";
        if (fileName.indexOf("S1") > -1) {
          date = fileName.replace("S1", "-03");
        } else if (fileName.indexOf("S2") > -1) {
          date = fileName.replace("S2", "-06");
        } else if (fileName.indexOf("S3") > -1) {
          date = fileName.replace("S3", "-09");
        } else if (fileName.indexOf("S4") > -1) {
          date = fileName.replace("S4", "-12");
        }

        aggregated_result[date] = result;

        const numOfResults = Object.keys(aggregated_result).length;

        if (numOfResults == num_seaons) {
          fs.writeFile(
            resultFilePath,
            JSON.stringify(aggregated_result, null, 2),
            err => {
              if (err) {
                return console.log(err);
              }

              console.log("The file was saved!");
            }
          );
        } else {
          console.log("Just save season data:", result);
        }
      } else {
        console.log("empty result data");
      }
    });
  }
}

function unzip(sourceZipPath, targetPath) {
  const zip = new AdmZip(sourceZipPath);
  zip.extractAllTo(
    targetPath,
    /* overwrite */
    true
  );
}

function readEachCSVFile(unzipPath, code, houseType, finishReadFun) {
  const readfilepath = `${unzipPath}/${code}_LVR_LAND_${houseType}.CSV`;

  console.log("try to read:", readfilepath);

  // const body = iconv.decode(fs.readFileSync(readfilepath), "Big5");

  try {
    const body = fs.readFileSync(readfilepath, "utf8");

    // handle data
    console.log("total data length:", body.length);
    finishReadFun(body);
  } catch (error) {
    console.log("fail to read file, maybe not exist");
    finishReadFun("");
  }
}

function loadAndParse(appendDate, sourceZipPath, unzipPath, dataCallback) {
  Promise.resolve("")
    .then(() => {
      unzip(sourceZipPath, unzipPath);

      console.log("unzip completed!");

      parser.parseHouseCSV(appendDate, unzipPath, readEachCSVFile, cityData => {
        console.log("houseData:", cityData);

        dataCallback(cityData);
      });
    })
    .catch(error => {
      console.log("unzip or parse error:");

      console.log(error);
    });
}

exports.downloadHouseData = downloadHouseData;
exports.load2018S3Zip = load2018S3Zip;
exports.load20171201ZipToJson = load20171201ZipToJson;
exports.loadArchiveZipToJson = loadArchiveZipToJson;
exports.uploadTestDataToFirebase = uploadTestDataToFirebase;
