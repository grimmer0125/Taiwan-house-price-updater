let CSV = require('comma-separated-values');

let cityList = [
  {code:"C", name:"基隆市"},
  {code:"A", name:"臺北市"},
  {code:"F", name:"新北市"},
  {code:"H", name:"桃園市"},
  {code:"O", name:"新竹市"},
  {code:"J", name:"新竹縣"},
  {code:"K", name:"苗栗縣"},
  {code:"B", name:"臺中市"},
  {code:"M", name:"南投縣"},
  {code:"N", name:"彰化縣"},
  {code:"P", name:"雲林縣"},
  {code:"I", name:"嘉義市"},
  {code:"Q", name:"嘉義縣"},
  {code:"D", name:"臺南市"},
  {code:"E", name:"高雄市"},
  {code:"T", name:"屏東縣"},//,它的A, ios讀不到!!
  {code:"G", name:"宜蘭縣"},
  {code:"U", name:"花蓮縣"},
  {code:"V", name:"臺東縣"},
  {code:"X", name:"澎湖縣"},
  {code:"W", name:"金門縣"},
  {code:"Z", name:"連江縣"}
];

var readCallback = null;
// module.exports = instead of "ES6 export"
module.exports = function parseHouseCSV(readFileFun, readAllCallback){
  readCallback = readAllCallback;
  console.log("start parseHouseCSV");

  let NumOfCity = cityList.length;

  // n x 2 個非同步
  for (let i=0; i< NumOfCity; i++){
    let parser = new priceFileParser(cityList[i].code);
    parser.startReadAsync(readFileFun);
  }
  console.log("loop all");
}

function checkAverage(code, average){

  let NumOfCity = cityList.length;
  let allGetAverage = true;
  let findOut = false;
  for (let i=0; i< NumOfCity; i++){
    const city = cityList[i];
    if(city.code === code){
      console.log("find out");
      city.price = average;
      findOut = true;
    }
    console.log("city:",city.name);
    if(city.price == null){
      console.log("this city.price is null");
      // console.log("city2:",city);

      allGetAverage = false;
    }

    if(allGetAverage==false && findOut){
      console.log("find out and sure not get all");
      break;
    }
  }

  if(allGetAverage){
    console.log("get all average!!!");
    readCallback(cityList);
  }
}

function priceFileParser(code){

  this.resultA = null;
  this.resultB = null;
  // this.fileA = null;
  // this.fileB = null;
  this.average = 0;
  this.code = code;

  this.calculateAverage = function(){

    if(this.resultA.total<0 || this.resultB.total<0){
      console.log("read some file error:%s", this.code);
      checkAverage(this.code, -1);

      return;
    }

    let totalNumber = this.resultA.number+ this.resultB.number;
    console.log('number:',this.resultA.number,this.resultB.number );
    console.log('total:', this.resultA.total, this.resultB.total);

    // let average = 0;
    if(totalNumber>0){
      this.average = (this.resultA.total+this.resultB.total)/totalNumber;
    }
    console.log('code:%s,average:%s', this.code, this.average);
    checkAverage(this.code, this.average);
  }

  this.startReadAsync = function(readAyncFun){

    console.log("startReadAsync1-A");

    readAyncFun(code,"A", (result)=>{
      // console.log("A:");
      console.log("read file A ok, str.len:", result.length);
      if(result.length>0){
        this.resultA =  this.getTotal(result); //maybe {total:0, number:0};

      } else {
        console.log("read file content len = 0, for code:", this.code);
        this.resultA = {total:-1, number:1};
      }

      if(this.resultB){
        console.log("calc A-B");
        this.calculateAverage();
      }
    });

    console.log("startReadAsync2-B");

    readAyncFun(code, "B", (result)=>{
      // console.log("B:", result);
      console.log("read file B ok, str.len:", result.length);
      if(result.length>0){
        this.resultB =  this.getTotal(result);
      } else {
        console.log("read file content len = 0, for code:", this.code);
        this.resultA = {total:-1, number:1};
      }

      if(this.resultA){
        console.log("calc B-A");
        this.calculateAverage();
      }
    });
  }

  this.getTotal = function(str) {

    let total =0;
    let num = 0;
    let csv = new CSV(str);

    let count=-1;
    csv.forEach(function(record) {
      count++;
      if (count>=1){
        // console.log('price:', record[22]); // it may be zero.
        // console.log("type:", record[1]);
        if(record[1] && record[1].indexOf("房地")>=0 && record[22]) {
          let price = record[22]*3.30579; //1m^2 = 0.3025 坪
          // console.log("price per Square footage:", price);
          num++;
          total+=price;
        }
      }
      // do something with the record
    });

    return {total:total, number:num}
  }

}
