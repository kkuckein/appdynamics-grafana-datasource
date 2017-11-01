import * as dateMath from 'app/core/utils/datemath';
import appEvents from 'app/core/app_events';
import * as utils from './utils';

/*
    This is the class where all AppD logic should reside.
    This gets Application Names, Metric Names and queries the API
*/

export class AppDynamicsSDK {

    username: string;
    password: string;
    tenant: string;
    url: string;

    constructor(instanceSettings, private backendSrv, private templateSrv) {

        // Controller settings
        this.username = instanceSettings.username;
        this.password = instanceSettings.password;
        this.url = instanceSettings.url;
        this.tenant = instanceSettings.tenant;

    }

    query(options) {
        const startTime = (Math.ceil(dateMath.parse(options.range.from)));
        const endTime = (Math.ceil(dateMath.parse(options.range.to)));

        const grafanaResponse = { data: [] };

        // For each one of the metrics the user entered:
        const requests = options.targets.map((target) => {
            return new Promise((resolve) => {

                if (target.hide) { // If the user clicked on the eye icon to hide, don't fetch the metrics.
                    resolve();
                } else {
                    const templatedApp = this.templateSrv.replace(target.application, options.scopedVars, 'regex');
                    const templatedMetric = this.templateSrv.replace(target.metric, options.scopedVars, 'regex');

                    // We need to also account for every combination of templated metric
                    const allQueries = utils.resolveMetricQueries(templatedMetric);
                    const everyRequest = allQueries.map((query) => {
                        return new Promise((innerResolve) => {
                            this.getMetrics(templatedApp, query, target, grafanaResponse, startTime, endTime, options, innerResolve);
                        });
                    });

                    return Promise.all(everyRequest).then(() => {
                        resolve();
                    });
                }
            });
        });

        return Promise.all(requests).then(() => {
            return grafanaResponse;
        });

    }

    getMetrics(templatedApp, templatedMetric, target, grafanaResponse, startTime, endTime, options, callback) {
        console.log(`Getting metric: App = ${templatedApp} Metric = ${templatedMetric}`);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + templatedApp + '/metric-data',
            method: 'GET',
            params: {
                'metric-path': templatedMetric,
                'time-range-type': 'BETWEEN_TIMES',
                'start-time': startTime,
                'end-time': endTime,
                'rollup': 'false',
                'output': 'json'
            },
            headers: { 'Content-Type': 'application/json' }
        }).then((response) => {

            // A single metric can have multiple results if the user chose to use a wildcard
            // Iterates on every result.

            response.data.forEach((metricElement) => {

                const pathSplit = metricElement.metricPath.split('|');
                let legend = target.showAppOnLegend ? templatedApp + ' - ' : '';

                // Legend options
                switch (target.transformLegend) {
                    case 'Segments': // TODO: Maybe a Regex option as well
                        const segments = target.transformLegendText.split(',');
                        for (let i = 0; i < segments.length; i++) {
                            const segment = Number(segments[i]) - 1;
                            if (segment < pathSplit.length) {
                                legend += pathSplit[segment] + (i === (segments.length - 1) ? '' : '|');
                            }
                        }
                        break;

                    default:
                        legend += metricElement.metricPath;
                }

                grafanaResponse.data.push({
                    target: legend,
                    datapoints: this.convertMetricData(metricElement)
                });
            });
        }).then(() => {
            callback();
        }).catch((err) => { // If we are here, we were unable to get metrics

            let errMsg = 'Error getting metrics.';
            if (err.data) {
                if (err.data.indexOf('Invalid application name') > -1) {
                    errMsg = `Invalid application name ${templatedApp}`;
                }
            }
            appEvents.emit('alert-error', ['Error', errMsg]);
            callback();
        });
    }

    // This helper method just converts the AppD response to the Grafana format
    convertMetricData(metricElement) {
        const responseArray = [];

        metricElement.metricValues.forEach((metricValue) => {
            responseArray.push([metricValue.value, metricValue.startTimeInMillis]);
        });

        return responseArray;
    }

    testDatasource() {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications', // TODO: Change this to a faster controller api call.
            method: 'GET',
            params: { output: 'json' }
        }).then((response) => {
            if (response.status === 200) {
                const numberOfApps = response.data.length;
                return { status: 'success', message: 'Data source is working, found ' + numberOfApps + ' apps', title: 'Success' };
            } else {
                return { status: 'failure', message: 'Data source is not working: ' + response.status, title: 'Failure' };
            }

        });
    }
    annotationQuery() {
        // TODO implement annotationQuery
    }

    getBusinessTransactionNames(appName) {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + appName + '/business-transactions',
            method: 'GET',
            params: { output: 'json' }
        }).then((response) => {
            if (response.status === 200) {
                return this.getFilteredNames('', response.data);
            } else {
                return [];
            }

        }).catch((error) => {
            return [];
        });
    }

    getTierNames(appName) {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + appName + '/tiers',
            method: 'GET',
            params: { output: 'json' }
        }).then((response) => {
            if (response.status === 200) {
                return this.getFilteredNames('', response.data);
            } else {
                return [];
            }

        }).catch((error) => {
            return [];
        });
    }

    getNodeNames(appName) {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + appName + '/nodes',
            method: 'GET',
            params: { output: 'json' }
        }).then((response) => {
            if (response.status === 200) {
                return this.getFilteredNames('', response.data);
            } else {
                return [];
            }

        }).catch((error) => {
            return [];
        });
    }

    getTemplateNames(query) {
        const possibleQueries = ['BusinessTransactions', 'Tiers', 'Nodes'];
        const templatedQuery = this.templateSrv.replace(query);

        if (templatedQuery.indexOf('.') > -1) {
            const appName = templatedQuery.split('.')[0];
            const type = templatedQuery.split('.')[1];

            if (possibleQueries.indexOf(type) === -1) {
                appEvents.emit('alert-error',
                    ['Error', 'Templating must be one of Applications, AppName.BusinessTransactions, AppName.Tiers, AppName.Nodes']);
            } else {
                switch (type) {
                    case 'BusinessTransactions':
                        return this.getBusinessTransactionNames(appName);
                    case 'Tiers':
                        return this.getTierNames(appName);
                    case 'Nodes':
                        return this.getNodeNames(appName);
                    default:
                        appEvents.emit('alert-error', ['Error', "The value after '.' must be BusinessTransactions, Tiers or Nodes"]);

                }
            }

        } else {
            return this.getApplicationNames('');
        }

    }

    getApplicationNames(query) {
        const templatedQuery = this.templateSrv.replace(query);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications',
            method: 'GET',
            params: { output: 'json' }
        }).then((response) => {
            if (response.status === 200) {
                return this.getFilteredNames(templatedQuery, response.data);
            } else {
                return [];
            }

        }).catch((error) => {
            return [];
        });
    }

    getMetricNames(app, query) {
        const templatedApp = this.templateSrv.replace(app);
        let templatedQuery = this.templateSrv.replace(query);
        templatedQuery = utils.getFirstTemplated(templatedQuery);
        console.log('TEMPLATED QUERY', templatedQuery);

        const params = { output: 'json' };
        if (query.indexOf('|') > -1) {
            params['metric-path'] = templatedQuery;
        }

        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + templatedApp + '/metrics',
            method: 'GET',
            params
        }).then((response) => {
            if (response.status === 200) {
                return this.getFilteredNames(templatedQuery, response.data);
            } else {
                return [];
            }

        }).catch((error) => {
            return [];
        });

    }

    getFilteredNames(query, arrayResponse) {
        if (query.indexOf('|') > -1) {
            const queryPieces = query.split('|');
            query = queryPieces[queryPieces.length - 1];
        }

        if (query.length === 0) {
            return arrayResponse;

        } else {
            // Only return the elements that match what the user typed, this is the essence of autocomplete.
            return arrayResponse.filter((element) => {
                return query.toLowerCase().indexOf(element.name.toLowerCase()) !== -1
                    || element.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });
        }
    }
}
