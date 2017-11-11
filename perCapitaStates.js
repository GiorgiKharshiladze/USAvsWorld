
var currentDate = new Date();
var year = currentDate.getFullYear()-3;

console.log(year);
var APIkey = '6647ACFF-BB61-40A2-925C-08953418103E';
var url =   'https://www.bea.gov/api/data/?&UserID='+APIkey+
            '&method=GetData&datasetname=RegionalProduct&GeoFIPS=STATE&Year='+year+
            '&ResultFormat=JSON&Component=PCRGDP_SAN&IndustryId=1';


var beaData = $.getJSON(url, function(data) {

    //data is the JSON string
    var myData = JSON.parse(beaData.responseText).BEAAPI.Results.Data;
    // var myData = d3.json(beaData);
    console.log(myData);
    jQuery.each(myData, function(i, val) {
        var Country = val.GeoName.replace("*","");
        console.log(Country, val.DataValue, "Dollars");
      });
});




// World bank Indicators
// http://api.worldbank.org/indicators?format=json&per_page=17000
// Call format
// http://api.worldbank.org/countries/all/indicators/NY.GDP.MKTP.CD?date=2014&per_page=264&format=json

// BEA
//https://www.bea.gov/api/data/?&UserID=6647ACFF-BB61-40A2-925C-08953418103E&method=GetData&datasetname=RegionalIncome&TableName=CA1&LineCode=3&GeoFIPS=STATE&Year=2014&ResultFormat=JSON&
