const fs = require('fs');

// const updateSeasonDataToFirebase = require("./testFirebase.js");
// updateSeasonDataToFirebase();
// return;

exports.downloadLatest = downloadLatest;

// return;

// copy from https://github.com/grimmer0125/TWHousePriceReactNative/blob/dev/parser.js
// import {parseHouseCSV} from './parser.js';
const parser = require('./parser.js');
const AdmZip = require('adm-zip');
const iconv = require('iconv-lite');

// another famous modules are request, request-progress, request-promise
// https://stackoverflow.com/a/36348693/7354486
const http = require('http');
// const fetch = require('node-fetch');

// import {storage} from './storageHelper.js'; storage.load & storage.save

// this url is not valid anymore
// const dataURL = "http://data.moi.gov.tw/MoiOD/System/DownloadFile.aspx?DATA=F0199ED0-184A-40D5-9506-95138F54159A";
// handle20171201();
function handle20171201() {
  const fileName = '1061201'; // +".zip";
  const fullFileName = `${fileName}.zip`;

  // const dataURL = "http://plvr.land.moi.gov.tw//Download?type=zip&fileName=" + fullFileName;
  // const file = fs.createWriteStream(fullFileName);
  // const request = http.get(dataURL, function(response) {
  //   response.pipe(file);
  //
  //   file.on('finish', function() {
  //     file.close(()=>{
  const zipFilePath = fullFileName; // dirs + fileName +".zip";
  const uncompressedPath = `out/${fileName}`;
  loadAndParse(true, zipFilePath, uncompressedPath, (result) => {
    // what is the date, 20171211.TXT -> 2017-12-11
    // date:result
    console.log('result:', result);

    fs.writeFile('20171201.json', JSON.stringify(result, null, 2), (err) => {
      if (err) {
        return console.log(err);
      }

      console.log('The file was saved!');
    });
  });
  //     });
  //   });
  // });
}

function uploadToFirebase(houseprice) {
  const admin = require('firebase-admin');

  const serviceAccount = require('./taiwanhouseprice-firebase-adminsdk.json');

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: 'https://taiwanhouseprice.firebaseio.com' });

  const defaultDatabase = admin.database();

  const dataPath = '/houseprice';
  // const fileName = "20171201.json";
  // const houseprice = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  defaultDatabase.ref(dataPath).update(houseprice).then(() => {
    console.log('upload house price to firebase ok');
    admin.app().delete();
  });
}

function downloadLatest() {
  const fileName = 'lvr_landcsv'; // +".zip";
  const fullFileName = `${fileName}.zip`;

  const dataURL = `http://plvr.land.moi.gov.tw//Download?type=zip&fileName=${fullFileName}`;
  const file = fs.createWriteStream(`/tmp/${fullFileName}`);
  const request = http.get(dataURL, (response) => {
    console.log('download ok!');
    response.pipe(file);

    file.on('finish', () => {
      console.log('save file ok!!');

      file.close(() => {
        console.log('close the file ok');

        const zipFilePath = `/tmp/${fullFileName}`; // dirs + fileName +".zip";
        const uncompressedPath = `${'/tmp/' + 'out/'}${fileName}`;
        loadAndParse(true, zipFilePath, uncompressedPath, (result) => {
          console.log('load and parse result ok:', result);
          console.log('next step is to upload to firebase or save it');

          // way1:
          // uploadToFirebase(result);

          // way2:
          fs.writeFile('latest.json', JSON.stringify(result, null, 2), (err) => {
            if (err) {
              return console.log(err);
            }

            console.log('The file was saved!');
            process.exit();
          });
        });
      });
    });
  });
}

// loadSeasonData();
function loadSeasonData() {
  // let fileName = "2017S3";
  const dirs = 'season-data/';

  const resultFilePath = 'result.json';
  const tatalFileList = [
    '2017S3',
    '2017S2',
    '2017S1',
    '2016S4',
    '2016S3',
    '2016S2',
    '2016S1',
    '2015S4',
    '2015S3',
    '2015S2',
    '2015S1',
    '2014S4',
    '2014S3',
    '2014S2',
    '2014S1',
    '2013S4',
    '2013S3',
    '2013S2',
    '2013S1',
    '2012S4',
  ];
  const num_seaons = tatalFileList.length;

  const aggregated_result = {};

  for (const fileName of tatalFileList) {
    const zipFilePath = `${dirs + fileName}.zip`;
    const uncompressedPath = `out/${fileName}`;

    loadAndParse(false, zipFilePath, uncompressedPath, (result) => {
      if (result) {
        let date = '';
        if (fileName.indexOf('S1') > -1) {
          date = fileName.replace('S1', '-03');
        } else if (fileName.indexOf('S2') > -1) {
          date = fileName.replace('S2', '-06');
        } else if (fileName.indexOf('S3') > -1) {
          date = fileName.replace('S3', '-09');
        } else if (fileName.indexOf('S4') > -1) {
          date = fileName.replace('S4', '-12');
        }

        aggregated_result[date] = result;

        const numOfResults = Object.keys(aggregated_result).length;

        if (numOfResults == num_seaons) {
          fs.writeFile(resultFilePath, JSON.stringify(aggregated_result, null, 2), (err) => {
            if (err) {
              return console.log(err);
            }

            console.log('The file was saved!');
          });
        } else {
          console.log('Just save season data:', result);
        }
      } else {
        console.log('empty result data');
      }
    });
  }

  // loadAndParse(zipFilePath, uncompressedPath, (result)=>{
  //     if (result) {
  //         fs.writeFile(resultFilePath, JSON.stringify(result, null, 2), function(err) {
  //             if(err) {
  //                 return console.log(err);
  //             }
  //
  //             console.log("The file was saved!");
  //         });
  //     } else {
  //         console.log("empty result data");
  //     }
  // });
}

// main();

// if (RNFetchBlob) {
//     dirs = RNFetchBlob.fs.dirs;
//
//     zipFilePath = dirs.DocumentDir + '/house.zip';
//     unzipPath = dirs.DocumentDir + "/house";
//     console.log("got the file path:", zipFilePath);
// }

// function saveResult(newData) {
//     console.log("in saveResult");
//
//     if (newData) {
//         fs.writeFile(resultFilePath, JSON.stringify(newData, null, 2), function(err) {
//             if(err) {
//                 return console.log(err);
//             }
//
//             console.log("The file was saved!");
//         });
//     } else {
//         console.log("empty result data");
//     }
// }

// download and save
// TODO change downloadFile to Node.js's fetch or load local file
function downloadFile_ReactNative(savePath) {
  // write file
  return RNFetchBlob.config({
    // add this option that makes response data to be stored as a file,
    // this is much more performant.
    //   fileCache : true,
    //   appendExt : 'png',
    path: savePath, // dirs.DocumentDir + '/house.zip',
  }).fetch('GET', dataURL, {
    // some headers ..

    // Beware that when using a file path as Image source on Android,
    // you must prepend "file://"" before the file path
    // imageView = <Image source={{ uri : Platform.OS === 'android' ? 'file://' + res.path()  : '' + res.path() }}/>
  });
}

// unzip, work
// TODO[done] change ZipArchive to Node.js version's unzip, adm-zip
function unzip(sourceZipPath, targetPath) {
  const zip = new AdmZip(sourceZipPath);
  zip.extractAllTo(targetPath,
  /* overwrite */
    true);

  // return ZipArchive.unzip(zipFilePath, unzipPath);
}

// copy from https://github.com/grimmer0125/TWHousePriceReactNative/
// method 1. use load iconv-lite, but it does not work on react-native
// current: 2. another way is to modify ios/android code of react-native-fetch-blob to read big5 encoding
// TODO use Node'js way to read BIG5 file to replace RNFetchBlob.fs.readStream
function readEachCSVFile(unzipPath, code, houseType, finishReadFun) {
  const readfilepath = `${unzipPath}/${code}_LVR_LAND_${houseType}.CSV`;

  console.log('try to read:', readfilepath);

  const body = iconv.decode(fs.readFileSync(readfilepath), 'Big5');

  // handle data
  console.log('total data length:', body.length);
  // console.log(body);
  finishReadFun(body);

  // let data = ''
  // RNFetchBlob.fs.readStream(
  //  encoding, should be one of `base64`, `utf8`, `ascii`
  // readfilepath, `big5`, 1095000 should set large enough
  //  file path
  //  4K buffer size.
  //  (optional) buffer size, default to 4096 (4095 for BASE64 encoded data)
  //  when reading file in BASE64 encoding, buffer size must be multiples of 3.
  // ).then((ifstream) => {
  //     ifstream.open()
  //     ifstream.onData((chunk) => {
  //          when encoding is `ascii`, chunk will be an array contains numbers
  //          otherwise it will be a string
  //         data += chunk
  //
  //          [asciiArray addObject:[NSNumber numberWithChar:bytePtr[i]]];
  //          when encoding is `ascii`, chunk will be an array contains numbers
  //
  //          console.log("chunk size:%s", chunk.length);
  //
  //          str = iconv.decode(new Buffer(chunk), 'Big5');
  //          console.log("final:", str);
  //     })
  //     ifstream.onError((err) => {
  //         console.log('oops-err', err);  not exist case and other cases
  //     })
  //     ifstream.onEnd(() => {
  //
  //         handle data
  //         console.log("total data length:", data.length);
  //         finishReadFun(data);
  //     })
  // })
}

// function parseHouseCSV(readFileFun, readAllCallback){
//   readCallback = readAllCallback;
//   console.log("start parseHouseCSV");
//
//   let NumOfCity = cityList.length;
//
//    n x 2 個非同步
//   for (let i=0; i< NumOfCity; i++){
//     let parser = new priceFileParser(cityList[i].code);
//     parser.readAndCountSync(readFileFun);
//   }
//   console.log("loop all");
// }

// function downloadAndParse(dataCallback) {
function loadAndParse(appendDate, sourceZipPath, unzipPath, dataCallback) {
  // console.log("start to download");
  //
  // downloadFile().then((res) => {
  //      the temp file path
  //     console.log('The file saved to ', res.path())
  //
  //     return unzip();
  // })

  // unzip()
  Promise.resolve('').then(() => {
    unzip(sourceZipPath, unzipPath);

    console.log('unzip completed!');
    // return;

    // comment temporarily
    parser.parseHouseCSV(appendDate, unzipPath, readEachCSVFile, (cityData) => {
      console.log('houseData:', cityData);

      // const newData = cityData.map(city=>{
      //     let finalNum = 0;
      //     if(city.price<0){
      //         finalNum ="error";
      //     } else if (city.price ==0) {
      //         finalNum = "沒有交易";
      //     } else {
      //         finalNum = (Math.round(city.price)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,
      //               ",");
      //     }
      //
      //     return city.name+":$"+finalNum;
      // });
      // console.log("new:", newData);

      // React native cache specific.
      // ref: https://github.com/grimmer0125/TWHousePriceReactNative/blob/dev/storageHelper.js

      // TODO[done] change to use Node.js's's save file? saveResult
      // storage.save(newData);

      dataCallback(cityData);
    });
  }).catch((error) => {
    console.log('unzip or parse error:');

    console.log(error);
  });
}

// this.onData  = this.onDataArrived.bind(this);
// downloadAndParse(onDataArrived);
//
// const JSZip = require("jszip");
// var zip = new JSZip();
//
// const bin = zipFilePath;
// zip.loadAsync(bin)
// .then(function (zip) {
//     console.log(zip.files);
//      folder1/folder2/folder3/file1.txt
// });
//
//  with createFolders: true, all folders will be created
// zip.loadAsync(bin, {createFolders: true})
// .then(function (zip) {
//     console.log(zip.files);
//      folder1/
//      folder1/folder2/
//      folder1/folder2/folder3/
//      folder1/folder2/folder3/file1.txt
// });
