var request = require('request');

request({
    method: 'GET',
    uri: 'http://192.168.0.10:8080/controller/rest/applications/BDR Prod/metric-data',
    qs: {
                'metric-path': 'Business Transaction Performance|Business Transactions|Tier1|/product/indoor|Calls per Minute',
                'time-range-type': 'BEFORE_NOW',
                'duration-in-mins': 30,
                'rollup': 'false',
                'output': 'json'
            },
    auth: {
    user: 'admin@customer1',
    pass: '181088',
  }

}, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', body); // Print the HTML for the Google homepage.
  convertMetricData(body);
});

function convertMetricData(metrics){
    var response = {target: 'David',
                    datapoints: []}
    metrics = JSON.parse(metrics);
    console.log(metrics[0]);
    metrics[0].metricValues.forEach(function(metricValue) {
        response.datapoints.push([metricValue.current, metricValue.startTimeInMillis])    
    });
    return response;
}