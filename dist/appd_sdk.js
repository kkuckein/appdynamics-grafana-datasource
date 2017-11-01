"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dateMath = require("app/core/utils/datemath");
var app_events_1 = require("app/core/app_events");
var utils = require("./utils");
/*
    This is the class where all AppD logic should reside.
    This gets Application Names, Metric Names and queries the API
*/
var AppDynamicsSDK = (function () {
    function AppDynamicsSDK(instanceSettings, backendSrv, templateSrv) {
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        // Controller settings
        this.username = instanceSettings.username;
        this.password = instanceSettings.password;
        this.url = instanceSettings.url;
        this.tenant = instanceSettings.tenant;
    }
    AppDynamicsSDK.prototype.query = function (options) {
        var _this = this;
        var startTime = (Math.ceil(dateMath.parse(options.range.from)));
        var endTime = (Math.ceil(dateMath.parse(options.range.to)));
        var grafanaResponse = { data: [] };
        // For each one of the metrics the user entered:
        var requests = options.targets.map(function (target) {
            return new Promise(function (resolve) {
                if (target.hide) {
                    resolve();
                }
                else {
                    _this.getMetrics(target, grafanaResponse, startTime, endTime, options, resolve);
                }
            });
        });
        return Promise.all(requests).then(function () {
            return grafanaResponse;
        });
    };
    AppDynamicsSDK.prototype.getMetrics = function (target, grafanaResponse, startTime, endTime, options, callback) {
        var _this = this;
        var templatedApp = this.templateSrv.replace(target.application, options.scopedVars, 'regex');
        var templatedMetric = this.templateSrv.replace(target.metric, options.scopedVars, 'regex');
        console.log(options);
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
        }).then(function (response) {
            // A single metric can have multiple results if the user chose to use a wildcard
            // Iterates on every result.
            response.data.forEach(function (metricElement) {
                var pathSplit = metricElement.metricPath.split('|');
                var legend = target.showAppOnLegend ? templatedApp + ' - ' : '';
                // Legend options
                switch (target.transformLegend) {
                    case 'Segments':// TODO: Maybe a Regex option as well
                        var segments = target.transformLegendText.split(',');
                        for (var i = 0; i < segments.length; i++) {
                            var segment = Number(segments[i]) - 1;
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
                    datapoints: _this.convertMetricData(metricElement, callback)
                });
            });
        }).then(function () {
            callback();
        })
            .catch(function (err) {
            var errMsg = 'Error getting metrics.';
            if (err.data) {
                if (err.data.indexOf('Invalid application name') > -1) {
                    errMsg = "Invalid application name " + templatedApp;
                }
            }
            app_events_1.default.emit('alert-error', ['Error', errMsg]);
            callback();
        });
    };
    // This helper method just converts the AppD response to the Grafana format
    AppDynamicsSDK.prototype.convertMetricData = function (metricElement, resolve) {
        var responseArray = [];
        metricElement.metricValues.forEach(function (metricValue) {
            responseArray.push([metricValue.value, metricValue.startTimeInMillis]);
        });
        return responseArray;
    };
    AppDynamicsSDK.prototype.testDatasource = function () {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                var numberOfApps = response.data.length;
                return { status: 'success', message: 'Data source is working, found ' + numberOfApps + ' apps', title: 'Success' };
            }
            else {
                return { status: 'failure', message: 'Data source is not working: ' + response.status, title: 'Failure' };
            }
        });
    };
    AppDynamicsSDK.prototype.annotationQuery = function () {
        // TODO implement annotationQuery
    };
    AppDynamicsSDK.prototype.getBusinessTransactionNames = function (appName) {
        var _this = this;
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + appName + '/business-transactions',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames('', response.data);
            }
            else {
                return [];
            }
        }).catch(function (error) {
            return [];
        });
    };
    AppDynamicsSDK.prototype.getTierNames = function (appName) {
        var _this = this;
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + appName + '/tiers',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames('', response.data);
            }
            else {
                return [];
            }
        }).catch(function (error) {
            return [];
        });
    };
    AppDynamicsSDK.prototype.getNodeNames = function (appName) {
        var _this = this;
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + appName + '/nodes',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames('', response.data);
            }
            else {
                return [];
            }
        }).catch(function (error) {
            return [];
        });
    };
    AppDynamicsSDK.prototype.getTemplateNames = function (query) {
        var possibleQueries = ['BusinessTransactions', 'Tiers', 'Nodes'];
        var templatedQuery = this.templateSrv.replace(query);
        if (templatedQuery.indexOf('.') > -1) {
            var appName = templatedQuery.split('.')[0];
            var type = templatedQuery.split('.')[1];
            if (possibleQueries.indexOf(type) === -1) {
                app_events_1.default.emit('alert-error', ['Error', 'Templating must be one of Applications, AppName.BusinessTransactions, AppName.Tiers, AppName.Nodes']);
            }
            else {
                switch (type) {
                    case 'BusinessTransactions':
                        return this.getBusinessTransactionNames(appName);
                    case 'Tiers':
                        return this.getTierNames(appName);
                    case 'Nodes':
                        return this.getNodeNames(appName);
                    default:
                        app_events_1.default.emit('alert-error', ['Error', "The value after '.' must be BusinessTransactions, Tiers or Nodes"]);
                }
            }
        }
        else {
            console.log('Getting Applications');
            return this.getApplicationNames('');
        }
    };
    AppDynamicsSDK.prototype.getApplicationNames = function (query) {
        var _this = this;
        var templatedQuery = this.templateSrv.replace(query);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames(templatedQuery, response.data);
            }
            else {
                return [];
            }
        }).catch(function (error) {
            return [];
        });
    };
    AppDynamicsSDK.prototype.getMetricNames = function (app, query) {
        var _this = this;
        var templatedApp = this.templateSrv.replace(app);
        var templatedQuery = this.templateSrv.replace(query);
        templatedQuery = utils.getFirstTemplated(templatedQuery);
        var params = { output: 'json' };
        if (query.indexOf('|') > -1) {
            params['metric-path'] = templatedQuery;
        }
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + templatedApp + '/metrics',
            method: 'GET',
            params: params
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames(templatedQuery, response.data);
            }
            else {
                return [];
            }
        }).catch(function (error) {
            return [];
        });
    };
    AppDynamicsSDK.prototype.getFilteredNames = function (query, arrayResponse) {
        if (query.indexOf('|') > -1) {
            var queryPieces = query.split('|');
            query = queryPieces[queryPieces.length - 1];
        }
        if (query.length === 0) {
            return arrayResponse;
        }
        else {
            // Only return the elements that match what the user typed, this is the essence of autocomplete.
            return arrayResponse.filter(function (element) {
                return query.toLowerCase().indexOf(element.name.toLowerCase()) !== -1
                    || element.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });
        }
    };
    return AppDynamicsSDK;
}());
exports.AppDynamicsSDK = AppDynamicsSDK;
