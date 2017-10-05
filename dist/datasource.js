"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var appd_sdk_1 = require("./appd_sdk");
var AppDynamicsDatasource = /** @class */ (function () {
    function AppDynamicsDatasource(instanceSettings, $q, backendSrv, templateSrv) {
        this.$q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.appD = new appd_sdk_1.AppDynamicsSDK(instanceSettings, backendSrv, templateSrv);
        this.templateSrv = templateSrv;
    }
    AppDynamicsDatasource.prototype.query = function (options) {
        return this.appD.query(options);
    };
    AppDynamicsDatasource.prototype.testDatasource = function () {
        return this.appD.testDatasource();
    };
    AppDynamicsDatasource.prototype.annotationQuery = function () {
        // TODO implement annotationQuery
    };
    AppDynamicsDatasource.prototype.metricFindQuery = function (query) {
        return this.appD.getApplicationNames('').then(function (results) {
            return results.map(function (result) {
                return { text: result.name };
            });
        });
    };
    return AppDynamicsDatasource;
}());
exports.AppDynamicsDatasource = AppDynamicsDatasource;
