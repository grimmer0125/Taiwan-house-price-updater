// TODO use TypeScript & linter to refactor
// TODO make city(data) as a class for default property value

const CSV = require('comma-separated-values');
const fs = require('fs');
const _ = require('lodash');

// const path = require('path');
// module.exports = instead of "ES6 export"
const houseConstant = require('./houseConstant.js');
// TypeError: parseHouseCSV is not a function if we use "exports= = function parseHouseCSV", since we reassign "exports"
// explanation: http://blog.hellojcc.tw/2016/01/08/module-exports-vs-exports-in-node-js/
exports.parseHouseCSV = (appendDate, startPath, readFileFun, readAllCallback) => {
  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }

  const cityList = _.cloneDeep(houseConstant.cityCode);

  console.log('start parseHouseCSV');

  const NumOfCity = cityList.length;

  // React native: n x 2 async-read
  // In current node.js, iconv.decode(fs.readFileSync is sync-blocking
  // even react-native async(promise), we can use Promise.all !!!!
  const keys = Object.keys(cityList);
  const keyCount = keys.length;
  for (const key of keys) {
    // each city
    const parser = new priceFileParser(key, cityList[key]);
    parser.readABTypeAndCountSync(startPath, readFileFun);
    // parser.calculateAverage(city);
    // if (this.city.dataA) {
    //   console.log("has read A & B, then calc A-B");
    //   this.calculateAverage(this.city);
    // }
  }

  console.log('loop all');

  if (appendDate) {
    // try to get the info. from the date file, e.g. 20171201.txt
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      // let filename=path.join(startPath,file);
      // const stat = fs.lstatSync(filename);
      // if (stat.isDirectory()){
      //     fromDir(filename,filter); recurse
      // }
      if (filename.indexOf('.TXT') >= 0 || filename.indexOf('.txt') >= 0) {
        // 20171211.TXT -> 2017-12-11
        const shortFilename = filename.slice(0, -4);

        const date = shortFilename.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

        // console.log('-- found: ',filename);
        const result = {};
        result[date] = cityList;
        readAllCallback(result);
        console.log('loop all');
      }
    }

    return;
  }

  // for season data
  readAllCallback(cityList);
};

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
  city.price = 0;
  city.dataA = null;// {};
  city.dataB = null;// {};
  city.districts = {};

  // city.resultA = null; //->dataA.total //不動產 //
  // TODO use city.numberA instead, no duplicate
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
  this.cityCode = code;

  this.readABTypeAndCountSync = function (unzipPath, readFun) {
    console.log('readABTypeAndCountSync1-A');

    readFun(unzipPath, this.cityCode, 'A', (content) => {
      // console.log("A:");
      this.city.dataA = {};
      console.log('read file A ok, str.len:', content.length);
      if (content.length > 0) {
        this.readCSVtoCalTotal(this.city, content, 'A', this.cityCode); // maybe {total:0, number:0};
      } else {
        console.log('read file content len = 0, for city:', this.city.name);
        this.city.dataA.total = -1;
        this.city.dataA.number = 0;
        // this.resultA = {
        //   total: -1,
        //   number: 1
        // };
      }

      console.log('finish reading a file, type A');

      // if (this.city.dataB) {
      //   console.log("has read A & B, then calc A-B");
      //   this.calculateAverage(this.city);
      // }
    });

    // NOTE since readFun is blocking (sync),
    // so the 2nd part will be start after 1st is finished.
    console.log('readABTypeAndCountSync2-B');

    readFun(unzipPath, this.cityCode, 'B', (content) => {
      // console.log("B:", result);
      this.city.dataB = {};
      console.log('read file B ok, str.len:', content.length);
      if (content.length > 0) {
        this.readCSVtoCalTotal(this.city, content, 'B');
      } else {
        console.log('read file content len = 0, for city:', this.city.name);
        // this.resultB = {
        //   total: -1,
        //   number: 0
        // };
        this.city.dataB.total = -1;
        this.city.dataB.number = 0;
      }

      console.log('finish reading a file, type B');

      // if (this.city.dataA) {
      //   console.log("has read A & B, then calc A-B");
      //   this.calculateAverage(this.city);
      // }
    });

    this.calculateAverage(this.city); // and its districts(regions)

    const districtNames = Object.keys(this.city.districts);
    // if (districtNames) {
    for (const district of districtNames) {
      const region = this.city.districts[district];
      this.calculateAverage(region);
    }
    // }
  };

  this.readCSVtoCalTotal = function (city, str, dataType, cityCode) {
    try {
      let cityData = null;
      if (dataType === 'A') {
        cityData = city.dataA;
      } else {
        cityData = city.dataB;
      }

      let total = 0;
      let num = 0;
      const csv = new CSV(str);

      let count = -1;
      csv.forEach((record) => {
        count++;
        if (count >= 1) {
        // console.log('price:', record[22]);  it may be zero.
        // console.log("type:", record[1]);
          if (record[1] && record[1].indexOf('房地') >= 0 && record[22]) {
            const price = record[22] * 3.30579; // 1m^2 = 0.3025 坪
            // console.log("price per Square footage:", price);
            num++;
            total += price;

            // only test 台北市's districts
            if (cityCode === 'A') {
            // step1: 分組, add total & number
              const district = record[0];
              const districts = houseConstant.TaipeiDistricts;
              if (districts.hasOwnProperty(district)) {
              // if (!city.districts) {
              //   city.districts = {};
              // }
              // price/ dataA / dataB
                if (!city.districts[district]) {
                  city.districts[district] = {
                    price: 0,
                    dataA: { price: 0, total: 0, number: 0 },
                    dataB: { price: 0, total: 0, number: 0 },
                  };
                }

                if (dataType === 'A') {
                  city.districts[district].dataA.total += price;
                  city.districts[district].dataA.number++;
                } else {
                  city.districts[district].dataB.total += price;
                  city.districts[district].dataB.number++;
                }
              } else {
                console.log('distinct is not in the known list !!!!');
              }
            }
          }
        }
      // do something with the record
      });

      cityData.total = total;
      cityData.number = num;
    } catch (e) {
      console.log(e);
    }
    // return {total: total, number: num}
  };

  this.calculateAverage = function (region) {
    // only for city type, not district type
    if (region.dataA.total < 0 || region.dataB.total < 0) {
      console.log('read some file error:%s', region.name);
      // checkAverage(this.code, -1);
      return;
    }

    console.log('total number, A:%s;B:%s', region.dataA.number, region.dataB.number);
    console.log('total price, A:%s;B:%s', region.dataA.total, region.dataB.total);

    if (region.dataA.total > 0) {
      region.dataA.price = region.dataA.total / region.dataA.number;
    }

    if (region.dataB.total > 0) {
      region.dataB.price = region.dataB.total / region.dataB.number;
    }

    const totalNumber = region.dataA.number + region.dataB.number;

    if (totalNumber > 0) {
      region.price = (region.dataA.total + region.dataB.total) / totalNumber;
    }
    console.log('city:%s,average:%s', region.name, region.price);


    // region.totalNumber = totalNumber;
    // region.price = this.average;
    // checkAverage(this.code, this.average);
  };
}
