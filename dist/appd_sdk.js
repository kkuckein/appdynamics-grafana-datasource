"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dateMath = require("app/core/utils/datemath");
var app_events_1 = require("app/core/app_events");
/*
    This is the class where all AppD logic should reside.
    This gets Application Names, Metric Names and queries the API
*/
var AppDynamicsSDK = (function () {
    function AppDynamicsSDK(instanceSettings, backendSrv) {
        this.backendSrv = backendSrv;
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
                    _this.getMetrics(target, grafanaResponse, startTime, endTime, resolve);
                }
            });
        });
        return Promise.all(requests).then(function () {
            return grafanaResponse;
        });
    };
    AppDynamicsSDK.prototype.getMetrics = function (target, grafanaResponse, startTime, endTime, callback) {
        var _this = this;
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + target.application + '/metric-data',
            method: 'GET',
            params: {
                'metric-path': target.metric,
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
                var legend = target.showAppOnLegend ? target.application + ' - ' : '';
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
                grafanaResponse.data.push({ target: legend,
                    datapoints: _this.convertMetricData(metricElement, callback) });
            });
        }).then(function () {
            callback();
        })
            .catch(function (err) {
            var errMsg = 'Error getting metrics.';
            if (err.data) {
                if (err.data.indexOf('Invalid application name') > -1) {
                    errMsg = "Invalid application name " + target.application;
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
    AppDynamicsSDK.prototype.getApplicationNames = function (query) {
        var _this = this;
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames(query, response.data);
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
        var params = { output: 'json' };
        if (query.indexOf('|') > -1) {
            params['metric-path'] = query;
        }
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + app + '/metrics',
            method: 'GET',
            params: params
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredNames(query, response.data);
            }
            else {
                return [];
            }
        }).catch(function (error) {
            return [];
        });
    };
    AppDynamicsSDK.prototype.getFilteredNames = function (query, arrayResponse) {
        var prefix = '';
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
                return query.toLowerCase().indexOf(element.name.toLowerCase()) !== -1 || element.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });
        }
    };
    return AppDynamicsSDK;
}());
exports.AppDynamicsSDK = AppDynamicsSDK;
