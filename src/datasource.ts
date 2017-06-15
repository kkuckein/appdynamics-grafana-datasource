export class AppDynamicsDatasource {

    username: string;
    password: string;
    tenant: string;
    url: string;

    constructor(instanceSettings, private $q, private backendSrv, private templateSrv) {

        // Controller settings
        this.username = instanceSettings.username;
        this.password = instanceSettings.password;
        this.url = instanceSettings.url;
        this.tenant = instanceSettings.tenant;

    }

    query(options) {
    console.log('OPTIONS');
    console.log(options);

    return this.backendSrv.datasourceRequest({
      url: this.url + '/controller/rest/applications/BDR Prod/metric-data',
      method: 'GET',
      params: {
                'metric-path': 'Business Transaction Performance|Business Transactions|Tier1|/product/indoor|Calls per Minute',
                'time-range-type': 'BEFORE_NOW',
                'duration-in-mins': 30,
                'rollup': 'false',
                'output': 'json'
            },
      headers: { 'Content-Type': 'application/json' }
    }).then ( (response) => {
        return this.convertMetricData(response);
    });
  }
    convertMetricData(metrics){
        const response = {target: 'test',
                          data: []
                         };

        metrics.data[0].metricValues.forEach( (metricValue) => {
            response.data.push([metricValue.current, metricValue.startTimeInMillis]);
        });
        return response;
    }

    testDatasource() {
        console.log('Test datasource');
        return this.backendSrv.datasourceRequest({
      url: this.url + '/api/controllerflags',
      method: 'GET'
    }).then( (response) => {
      if (response.status === 200) {
        return { status: 'success', message: 'Data source is working', title: 'Success' };
      }
      else {
          return { status: 'failure', message: 'Data source is not working', title: 'Failure' };
        }

    });
}
    annotationQuery() {
        // TODO implement annotationQuery
    }

    metricFindQuery() {
        console.log('Fuck my life');
        // TODO implement metricFindQuery
    }
}