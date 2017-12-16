let CSV = require('comma-separated-values');
const fs = require('fs');
// const path = require('path');
// module.exports = instead of "ES6 export"
module.exports = function parseHouseCSV(appendDate, startPath, readFileFun, readAllCallback) {

  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  let cityList = {
    "C": {
      name: "基隆市"
    },
    "A": {
      name: "臺北市"
    },
    "F": {
      name: "新北市"
    },
    "H": {
      name: "桃園市"
    },
    "O": {
      name: "新竹市"
    },
    "J": {
      name: "新竹縣"
    },
    "K": {
      name: "苗栗縣"
    },
    "B": {
      name: "臺中市"
    },
    "M": {
      name: "南投縣"
    },
    "N": {
      name: "彰化縣"
    },
    "P": {
      name: "雲林縣"
    },
    "I": {
      name: "嘉義市"
    },
    "Q": {
      name: "嘉義縣"
    },
    "D": {
      name: "臺南市"
    },
    "E": {
      name: "高雄市"
    },
    "T": {
      name: "屏東縣"
    }, //,它的A, ios讀不到!!
    "G": {
      name: "宜蘭縣"
    },
    "U": {
      name: "花蓮縣"
    },
    "V": {
      name: "臺東縣"
    },
    "X": {
      name: "澎湖縣"
    },
    "W": {
      name: "金門縣"
    },
    "Z": {
      name: "連江縣"
    }
  };

  console.log("start parseHouseCSV");

  let NumOfCity = cityList.length;

  // React native: n x 2 async-read
  // In current node.js, iconv.decode(fs.readFileSync is sync-blocking
  // even react-native async(promise), we can use Promise.all !!!!
  const keys = Object.keys(cityList);
  const keyCount = keys.length;
  for (let key of keys) {
    let parser = new priceFileParser(key, cityList[key]);
    parser.startReadAsync(startPath, readFileFun);
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

  this.resultA = null; //不動產
  this.resultB = null; //預售屋
  // this.fileA = null;
  // this.fileB = null;
  // this.average = 0;
  city.price = 0;

  city.priceA = 0;
  city.priceB = 0;
  city.numberA = 0;
  city.numberB = 0;

  this.city = city;
  this.code = code;

  this.calculateAverage = function() {

    if (this.resultA.total < 0 || this.resultB.total < 0) {
      console.log("read some file error:%s", this.code);
      // checkAverage(this.code, -1);

      return;
    }

    let totalNumber = this.resultA.number + this.resultB.number;
    console.log('number:', this.resultA.number, this.resultB.number);
    console.log('total:', this.resultA.total, this.resultB.total);

    // let average = 0;
    if (totalNumber > 0) {
      this.city.price = (this.resultA.total + this.resultB.total) / totalNumber;
    }
    console.log('city:%s,average:%s', this.city.name, this.city.price);

    if (this.resultA.total > 0) {
      this.city.priceA = this.resultA.total / this.resultA.number;
      this.city.numberA = this.resultA.number;
    }

    if (this.resultB.total > 0) {
      this.city.priceB = this.resultB.total / this.resultB.number;
      this.city.numberB = this.resultB.number;
    }
    // this.city.totalNumber = totalNumber;
    // this.city.price = this.average;
    // checkAverage(this.code, this.average);
  }

  this.startReadAsync = function(unzipPath, readAyncFun) {

    console.log("startReadAsync1-A");

    readAyncFun(unzipPath, this.code, "A", (result) => {
      // console.log("A:");
      console.log("read file A ok, str.len:", result.length);
      if (result.length > 0) {
        this.resultA = this.getTotal(result); //maybe {total:0, number:0};

      } else {
        console.log("read file content len = 0, for city:", this.city.name);
        this.resultA = {
          total: -1,
          number: 1
        };
      }

      if (this.resultB) {
        console.log("calc A-B");
        this.calculateAverage();
      }
    });

    console.log("startReadAsync2-B");

    readAyncFun(unzipPath, this.code, "B", (result) => {
      // console.log("B:", result);
      console.log("read file B ok, str.len:", result.length);
      if (result.length > 0) {
        this.resultB = this.getTotal(result);
      } else {
        console.log("read file content len = 0, for city:", this.city.name);
        this.resultA = {
          total: -1,
          number: 1
        };
      }

      if (this.resultA) {
        console.log("calc B-A");
        this.calculateAverage();
      }
    });
  }

  this.getTotal = function(str) {

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

    return {total: total, number: num}
  }

}
