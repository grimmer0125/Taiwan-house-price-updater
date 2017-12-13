// copy from https://github.com/grimmer0125/TWHousePriceReactNative/blob/dev/parser.js
// import {parseHouseCSV} from './parser.js';
const parseHouseCSV = require("./parser.js");
const AdmZip = require('adm-zip');

//import {storage} from './storageHelper.js'; storage.load & storage.save

function onDataArrived(newData) {
    console.log("onDataArrived");
}

// this url is not valid anymore
// const dataURL = "http://data.moi.gov.tw/MoiOD/System/DownloadFile.aspx?DATA=F0199ED0-184A-40D5-9506-95138F54159A";

let dirs = "season-data";
let zipFilePath = dirs + "/2017S3.zip";
// let zipFilePath = "2017S3.zip";

let unzipPath = dirs+ "/2017S3";
// if (RNFetchBlob) {
//     dirs = RNFetchBlob.fs.dirs;
//
//     zipFilePath = dirs.DocumentDir + '/house.zip';
//     unzipPath = dirs.DocumentDir + "/house";
//     console.log("got the file path:", zipFilePath);
// }

// download and save
//TODO change downloadFile to Node.js's fetch or load local file
function downloadFile() {
    // write file
    return RNFetchBlob.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        //   fileCache : true,
        //   appendExt : 'png',
        path: zipFilePath, //dirs.DocumentDir + '/house.zip',
    }).fetch('GET', dataURL, {
        // some headers ..

        // Beware that when using a file path as Image source on Android,
        // you must prepend "file://"" before the file path
        // imageView = <Image source={{ uri : Platform.OS === 'android' ? 'file://' + res.path()  : '' + res.path() }}/>
    });
}

// unzip, work
//TODO[done] change ZipArchive to Node.js version's unzip, adm-zip
function unzip() {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(unzipPath, /*overwrite*/true);

    // return ZipArchive.unzip(zipFilePath, unzipPath);
}

// copy from https://github.com/grimmer0125/TWHousePriceReactNative/
// method 1. use load iconv-lite, but it does not work on react-native
// current: 2. another way is to modify ios/android code of react-native-fetch-blob to read big5 encoding
//TODO use Node'js way to read BIG5 file to replace RNFetchBlob.fs.readStream
function readEachCSVFile(code, houseType, finishReadFun) {

    const readfilepath = unzipPath + "/" + code + "_LVR_LAND_" + houseType + ".CSV";

    console.log('try to read:', readfilepath);

    let data = ''
    RNFetchBlob.fs.readStream(
    // encoding, should be one of `base64`, `utf8`, `ascii`
    readfilepath, `big5`, 1095000 //should set large enough
    // file path
    // 4K buffer size.
    // (optional) buffer size, default to 4096 (4095 for BASE64 encoded data)
    // when reading file in BASE64 encoding, buffer size must be multiples of 3.
    ).then((ifstream) => {
        ifstream.open()
        ifstream.onData((chunk) => {
            // when encoding is `ascii`, chunk will be an array contains numbers
            // otherwise it will be a string
            data += chunk

            // [asciiArray addObject:[NSNumber numberWithChar:bytePtr[i]]];
            // when encoding is `ascii`, chunk will be an array contains numbers

            // console.log("chunk size:%s", chunk.length);

            // str = iconv.decode(new Buffer(chunk), 'Big5');
            // console.log("final:", str);
        })
        ifstream.onError((err) => {
            console.log('oops-err', err); // not exist case and other cases
        })
        ifstream.onEnd(() => {

            //handle data
            console.log("total data length:", data.length);
            finishReadFun(data);
        })
    })
}


// function parseHouseCSV(readFileFun, readAllCallback){
//   readCallback = readAllCallback;
//   console.log("start parseHouseCSV");
//
//   let NumOfCity = cityList.length;
//
//   // n x 2 個非同步
//   for (let i=0; i< NumOfCity; i++){
//     let parser = new priceFileParser(cityList[i].code);
//     parser.startReadAsync(readFileFun);
//   }
//   console.log("loop all");
// }



function downloadAndParse(dataCallback) {

    // console.log("start to download");
    //
    // downloadFile().then((res) => {
    //     // the temp file path
    //     console.log('The file saved to ', res.path())
    //
    //     return unzip();
    // })

    //unzip()
    Promise.resolve("")
    .then(() => {

        unzip();

        console.log('unzip completed!');
        // return;

        // comment temporarily
        parseHouseCSV(readEachCSVFile, cityData => {
            console.log("houseData:", cityData);
            const newData = cityData.map(city=>{
                let finalNum = 0;
                if(city.price<0){
                    finalNum ="error";
                } else if (city.price ==0) {
                    finalNum = "沒有交易";
                } else {
                    finalNum = (Math.round(city.price)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,
                          ",");
                }

                return city.name+":$"+finalNum;
            });
            console.log("new:", newData);
            // newData.splice(0, 0, title);

            // React native cache specific.
            // ref: https://github.com/grimmer0125/TWHousePriceReactNative/blob/dev/storageHelper.js
            // TODO change to use Node.js's's save file?
            // storage.save(newData);

            dataCallback(newData);
        });

    }).catch((error) => {
        console.log('unzip error:');

        console.log(error);
    })
}

//this.onData  = this.onDataArrived.bind(this);
// downloadAndParse(onDataArrived);
//
// const JSZip = require("jszip");
// var zip = new JSZip();
//
// const bin = zipFilePath;
// zip.loadAsync(bin)
// .then(function (zip) {
//     console.log(zip.files);
//     // folder1/folder2/folder3/file1.txt
// });
//
// // with createFolders: true, all folders will be created
// zip.loadAsync(bin, {createFolders: true})
// .then(function (zip) {
//     console.log(zip.files);
//     // folder1/
//     // folder1/folder2/
//     // folder1/folder2/folder3/
//     // folder1/folder2/folder3/file1.txt
// });


unzip();
