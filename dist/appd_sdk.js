"use strict";
exports.__esModule = true;
var AppDynamicsSDK = (function () {
    function AppDynamicsSDK(instanceSettings, backendSrv) {
        this.backendSrv = backendSrv;
        // Controller settings porra
        this.username = instanceSettings.username;
        this.password = instanceSettings.password;
        this.url = instanceSettings.url;
        this.tenant = instanceSettings.tenant;
    }
    AppDynamicsSDK.prototype.query = function (options) {
        var _this = this;
        console.log('OPTIONS');
        console.log(options);
        var grafanaResponse = { data: [] };
        var requests = options.targets.map(function (target) {
            return new Promise(function (resolve) {
                console.log('MAP', target);
                _this.getMetrics(target, grafanaResponse, resolve);
            });
        });
        return Promise.all(requests).then(function () {
            console.log(grafanaResponse);
            return grafanaResponse;
        });
    };
    AppDynamicsSDK.prototype.getMetrics = function (target, grafanaResponse, callback) {
        var _this = this;
        console.log('getMetrics', target);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications/' + target.application + '/metric-data',
            method: 'GET',
            params: {
                'metric-path': target.metric,
                'time-range-type': 'BEFORE_NOW',
                'duration-in-mins': 60 * 6,
                'rollup': 'false',
                'output': 'json'
            },
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            grafanaResponse.data.push({ target: target.metric,
                datapoints: _this.convertMetricData(response, callback) });
        }).then(function () {
            callback();
        });
    };
    AppDynamicsSDK.prototype.convertMetricData = function (metrics, resolve) {
        console.log('convertMetricData');
        var responseArray = [];
        metrics.data[0].metricValues.forEach(function (metricValue) {
            responseArray.push([metricValue.current, metricValue.startTimeInMillis]);
        });
        return responseArray;
    };
    AppDynamicsSDK.prototype.testDatasource = function () {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/api/controllerflags',
            method: 'GET'
        }).then(function (response) {
            if (response.status === 200) {
                return { status: 'success', message: 'Data source is working', title: 'Success' };
            }
            else {
                return { status: 'failure', message: 'Data source is not working', title: 'Failure' };
            }
        });
    };
    AppDynamicsSDK.prototype.annotationQuery = function () {
        // TODO implement annotationQuery
    };
    AppDynamicsSDK.prototype.getApplicationNames = function (query) {
        var _this = this;
        console.log('Trying to get data');
        console.log(query);
        return this.backendSrv.datasourceRequest({
            url: this.url + '/controller/rest/applications',
            method: 'GET',
            params: { output: 'json' }
        }).then(function (response) {
            if (response.status === 200) {
                return _this.getFilteredAppNames(query, response.data);
            }
            else {
                return [];
            }
        });
    };
    AppDynamicsSDK.prototype.getFilteredAppNames = function (query, apps) {
        var appNames = apps.map(function (app) { return app.name; });
        return appNames.filter(function (app) {
            return app.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
    };
    return AppDynamicsSDK;
}());
exports.AppDynamicsSDK = AppDynamicsSDK;
