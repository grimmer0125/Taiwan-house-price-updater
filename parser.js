//TODO use TypeScript & linter to refactor

let CSV = require('comma-separated-values');
const fs = require('fs');
const _ = require('lodash');

// const path = require('path');
// module.exports = instead of "ES6 export"
const houseConstant = require('./houseConstant.js');
// TypeError: parseHouseCSV is not a function if we use "exports= = function parseHouseCSV", since we reassign "exports"
// explanation: http://blog.hellojcc.tw/2016/01/08/module-exports-vs-exports-in-node-js/
exports.parseHouseCSV = (appendDate, startPath, readFileFun, readAllCallback) => {

  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  //NOTE Or change houseConst.js .json
  let cityList = _.cloneDeep(houseConstant.cityCode);

  // let cityList = {
  //   "C": {
  //     name: "基隆市"
  //   },
  //   "A": {
  //     name: "臺北市"
  //   },
  //   "F": {
  //     name: "新北市"
  //   },
  //   "H": {
  //     name: "桃園市"
  //   },
  //   "O": {
  //     name: "新竹市"
  //   },
  //   "J": {
  //     name: "新竹縣"
  //   },
  //   "K": {
  //     name: "苗栗縣"
  //   },
  //   "B": {
  //     name: "臺中市"
  //   },
  //   "M": {
  //     name: "南投縣"
  //   },
  //   "N": {
  //     name: "彰化縣"
  //   },
  //   "P": {
  //     name: "雲林縣"
  //   },
  //   "I": {
  //     name: "嘉義市"
  //   },
  //   "Q": {
  //     name: "嘉義縣"
  //   },
  //   "D": {
  //     name: "臺南市"
  //   },
  //   "E": {
  //     name: "高雄市"
  //   },
  //   "T": {
  //     name: "屏東縣"
  //   }, //,它的A, ios讀不到!!
  //   "G": {
  //     name: "宜蘭縣"
  //   },
  //   "U": {
  //     name: "花蓮縣"
  //   },
  //   "V": {
  //     name: "臺東縣"
  //   },
  //   "X": {
  //     name: "澎湖縣"
  //   },
  //   "W": {
  //     name: "金門縣"
  //   },
  //   "Z": {
  //     name: "連江縣"
  //   }
  // };

  console.log("start parseHouseCSV");

  let NumOfCity = cityList.length;

  // React native: n x 2 async-read
  // In current node.js, iconv.decode(fs.readFileSync is sync-blocking
  // even react-native async(promise), we can use Promise.all !!!!
  const keys = Object.keys(cityList);
  const keyCount = keys.length;
  for (let key of keys) {
    let parser = new priceFileParser(key, cityList[key]);
    parser.startReadSync(startPath, readFileFun);
  }

  console.log("loop all");

  if (appendDate) {
    // try to get the info. from the date file, e.g. 20171201.txt
    const files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
      const filename = files[i];
      // let filename=path.join(startPath,file);
      // const stat = fs.lstatSync(filename);
      // if (stat.isDirectory()){
      //     fromDir(filename,filter); recurse
      // }
      if (filename.indexOf('.TXT') >= 0 || filename.indexOf('.txt') >= 0) {
        // 20171211.TXT -> 2017-12-11
        const shortFilename = filename.slice(0, -4);

        const date = shortFilename.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

        // console.log('-- found: ',filename);
        const result = {};
        result[date] = cityList;
        readAllCallback(result);
        console.log("loop all");
      }
    }

    return;
  }

  // for season data
  readAllCallback(cityList);

}

// function checkAverage(code, average){
//
//   let NumOfCity = cityList.length;
//   let allGetAverage = true;
//   let findOut = false;
//   for (let i=0; i< NumOfCity; i++){
//     const city = cityList[i];
//     if(city.code === code){
//       console.log("fill city price:", city.name, ";price:", average);
//       city.price = average;
//       findOut = true;
//     }
//      console.log("city:",city.name);
//     if(city.price == null){
//        console.log("this city.price is null");
//        console.log("city2:",city);
//
//       allGetAverage = false;
//     }
//
//     if(allGetAverage==false && findOut){
//       console.log("find out and sure not get all");
//       break;
//     }
//   }
//
//   if(allGetAverage){
//     console.log("get all average!!!");
//     readCallback(cityList);
//   }
// }

function priceFileParser(code, city) {

  city.districts = null;
  city.price = 0;
  city.dataA = null;// {};
  city.dataB = null;//{};

  // city.resultA = null; //->dataA.total //不動產 //
  //TODO use city.numberA instead, no duplicate
  // {
  //   total:
  //   number
  // }
  // this.resultB = null; //預售屋
  // this.fileA = null;
  // this.fileB = null;
  // this.average = 0;
  // city.priceA = 0;
  // city.priceB = 0;
  // city.numberA = 0;
  // city.numberB = 0;

  this.city = city;
  this.code = code;

  this.startReadSync = function(unzipPath, readFun) {

    console.log("startReadSync1-A");

    readFun(unzipPath, this.code, "A", (content) => {
      // console.log("A:");
      this.city.dataA = {};
      console.log("read file A ok, str.len:", content.length);
      if (content.length > 0) {
        this.readCSVtoCalTotal(this.city.dataA, content); //maybe {total:0, number:0};

      } else {
        console.log("read file content len = 0, for city:", this.city.name);
        this.city.dataA.total =  -1;
        this.city.dataA.number = 0;
        // this.resultA = {
        //   total: -1,
        //   number: 1
        // };
      }

      if (this.city.dataB) {
        console.log("has read A & B, then calc A-B");
        this.calculateAverage();
      }
    });

    console.log("startReadSync2-B");

    readFun(unzipPath, this.code, "B", (content) => {
      // console.log("B:", result);
      this.city.dataB = {};
      console.log("read file B ok, str.len:", content.length);
      if (content.length > 0) {
        this.readCSVtoCalTotal(this.city.dataB, content);
      } else {
        console.log("read file content len = 0, for city:", this.city.name);
        // this.resultB = {
        //   total: -1,
        //   number: 0
        // };
        this.city.dataB.total =  -1;
        this.city.dataB.number = 0;
      }

      if (this.city.dataA) {
        console.log("has read A & B, then calc A-B");
        this.calculateAverage();
      }
    });
  };

  this.readCSVtoCalTotal = function(cityData, str) {

    let total = 0;
    let num = 0;
    let csv = new CSV(str);

    let count = -1;
    csv.forEach(function(record) {
      count++;
      if (count >= 1) {
        // console.log('price:', record[22]);  it may be zero.
        // console.log("type:", record[1]);
        if (record[1] && record[1].indexOf("房地") >= 0 && record[22]) {
          let price = record[22] * 3.30579; //1m^2 = 0.3025 坪
          // console.log("price per Square footage:", price);
          num++;
          total += price;
        }
      }
      // do something with the record
    });

    cityData.total = total;
    cityData.number = num;
    // return {total: total, number: num}
  };

  this.calculateAverage = function() {

    // city.priceA = 0;
    // city.priceB = 0;
    // city.numberA = 0;
    // city.numberB = 0;

    if (this.city.dataA.total< 0 || this.city.dataB.total < 0) {
      console.log("read some file error:%s", this.city.name);
      // checkAverage(this.code, -1);

      return;
    }

    console.log('total number, A:%s;B:%s', this.city.dataA.number, this.city.dataB.number);
    console.log('total price, A:%s;B:%s', this.city.dataA.total, this.city.dataB.total);

    if (this.city.dataA.total > 0) {
      this.city.dataA.price = this.city.dataA.total / this.city.dataA.number;
      // this.city.numberA = this.resultA.number;
    }

    if (this.city.dataB.total > 0) {
      this.city.dataB.price = this.city.dataB.total / this.city.dataB.number;
    }

    const totalNumber = this.city.dataA.number + this.city.dataB.number;

    // let average = 0;
    if (totalNumber > 0) {
      this.city.price = (this.city.dataA.total + this.city.dataB.total) / totalNumber;
    }
    console.log('city:%s,average:%s', this.city.name, this.city.price);


    // this.city.totalNumber = totalNumber;
    // this.city.price = this.average;
    // checkAverage(this.code, this.average);
  }

}
