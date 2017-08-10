"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("app/plugins/sdk");
var AppDynamicsQueryCtrl = (function (_super) {
    __extends(AppDynamicsQueryCtrl, _super);
    function AppDynamicsQueryCtrl($scope, $injector, $q, uiSegmentSrv, templateSrv) {
        var _this = _super.call(this, $scope, $injector) || this;
        _this.$q = $q;
        _this.uiSegmentSrv = uiSegmentSrv;
        _this.templateSrv = templateSrv;
        _this.uiSegmentSrv = uiSegmentSrv;
        _this.appD = _this.datasource.appD;
        _this.target.application = _this.target.application || 'Application';
        _this.applicationSegment = uiSegmentSrv.newSegment(_this.target.application);
        // this.target.metric = this.target.metric || 'Select a metric path';
        // this.metricSegment = uiSegmentSrv.newSegment(this.target.metric);
        // this.metricPath = ['David'];
        console.log(_this.applicationSegment);
        _this.getApplicationNames = function (query) {
            return _this.appD.getApplicationNames(query)
                .then(_this.transformToSegments(false));
        };
        _this.getMetricNames = function (query, callback) {
            _this.appD.getMetricNames(_this.target.application, query)
                .then(callback);
        };
        return _this;
    }
    AppDynamicsQueryCtrl.prototype.appChanged = function () {
        this.target.application = this.applicationSegment.value;
        this.panelCtrl.refresh();
    };
    AppDynamicsQueryCtrl.prototype.metricChanged = function () {
        this.target.metric = this.metricSegment.value;
        this.panelCtrl.refresh();
    };
    AppDynamicsQueryCtrl.prototype.toggleEditorMode = function () {
        this.target.rawQuery = !this.target.rawQuery;
    };
    AppDynamicsQueryCtrl.prototype.onChangeInternal = function () {
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
    };
    AppDynamicsQueryCtrl.prototype.transformToSegments = function (addTemplateVars) {
        var _this = this;
        return function (results) {
            var segments = results.map(function (segment) {
                return _this.uiSegmentSrv.newSegment({ value: segment });
            });
            console.log(segments);
            return segments;
        };
    };
    AppDynamicsQueryCtrl.templateUrl = 'partials/query.editor.html';
    return AppDynamicsQueryCtrl;
}(sdk_1.QueryCtrl));
exports.AppDynamicsQueryCtrl = AppDynamicsQueryCtrl;
