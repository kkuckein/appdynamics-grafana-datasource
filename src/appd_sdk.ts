export class AppDynamicsSDK {

    username: string;
    password: string;
    tenant: string;
    url: string;

    constructor(instanceSettings, private backendSrv) {

        // Controller settings porra
        this.username = instanceSettings.username;
        this.password = instanceSettings.password;
        this.url = instanceSettings.url;
        this.tenant = instanceSettings.tenant;

    }

    query(options) {
        console.log('OPTIONS');
        console.log(options);

        const grafanaResponse = {data: []};

        const requests = options.targets.map((target) => {
            return new Promise((resolve) => {
                console.log('MAP', target);
                this.getMetrics(target, grafanaResponse, resolve);

            });
        });

        return Promise.all(requests).then( () => {
            console.log(grafanaResponse)    ;
            return grafanaResponse;
        } );

    }

    getMetrics(target, grafanaResponse, callback) {
        console.log('getMetrics', target);
        return this.backendSrv.datasourceRequest({
                url: this.url + '/controller/rest/applications/' + target.application + '/metric-data',
                method: 'GET',
                params: {
                            'metric-path': target.metric,
                            'time-range-type': 'BEFORE_NOW',
                            'duration-in-mins': 60 * 6,  // TODO: Actually use what Grafana is sending for the times
                            'rollup': 'false',
                            'output': 'json'
                        },
                headers: { 'Content-Type': 'application/json' }
            }).then ( (response) => {

                const dividers = target.metric.split('|');

                const legend = dividers.length > 3 ? dividers[3] : dividers[dividers.length - 1];
                grafanaResponse.data.push({target: target.application + ' - ' + legend,
                                           datapoints: this.convertMetricData(response, callback)});
            }).then ( () => {
                callback();
            });
    }

    convertMetricData(metrics, resolve) {
        console.log('convertMetricData');

        const responseArray = [];

        metrics.data[0].metricValues.forEach( (metricValue) => {
            responseArray.push([metricValue.current, metricValue.startTimeInMillis]);
        });

        return responseArray;
    }

    testDatasource() {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/api/controllerflags',
            method: 'GET'
            }).then( (response) => {
                if (response.status === 200) {
                    return { status: 'success', message: 'Data source is working', title: 'Success' };
                }else {
                    return { status: 'failure', message: 'Data source is not working', title: 'Failure' };
                }

            });
    }
    annotationQuery() {
        // TODO implement annotationQuery
    }

    getApplicationNames(query) {
        console.log('Trying to get data');
        console.log(query);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications',
            method: 'GET',
            params: { output: 'json'}
            }).then( (response) => {
                if (response.status === 200) {
                    return this.getFilteredAppNames(query, response.data);
                }else {
                    return [];
                }

            });
    }

    getFilteredAppNames(query, apps) {

        const appNames = apps.map( (app) =>  app.name);
        return appNames.filter( (app) => {
            return app.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
    }
}
