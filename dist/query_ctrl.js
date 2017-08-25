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
        _this.metricSegmentValueChanged = function (metricSegment, segmentIndex) {
            // Only add a new one if it is the last and it is not a Leaf.
            if (segmentIndex === _this.metricSegments.length - 1 && metricSegment.expandable) {
                _this.metricSegments.push(_this.uiSegmentSrv.newSelectMetric());
            }
            // If this is a Leaf, we don't need the segments after it.
            if (segmentIndex < _this.metricSegments.length - 1 && !metricSegment.expandable) {
                _this.metricSegments.length = index + 1;
            }
            _this.target.metric = _this.metricSegments.map(function (segment) { return segment.value; }).join('|');
            _this.panelCtrl.refresh();
        };
        _this.uiSegmentSrv = uiSegmentSrv;
        _this.appD = _this.datasource.appD;
        _this.target.application = _this.target.application || 'Application';
        _this.applicationSegment = uiSegmentSrv.newSegment(_this.target.application);
        // TODO - When copying, how to maintain the metrics?
        _this.metricSegments = [_this.uiSegmentSrv.newSelectMetric()];
        _this.getApplicationNames = function (query) {
            return _this.appD.getApplicationNames(query)
                .then(_this.transformToSegments(false));
        };
        _this.getMetricNames = function (index) {
            return _this.appD.getMetricNames(_this.target.application, _this.getSegmentPathUpTo(index))
                .then(_this.transformToSegments(false));
        };
        return _this;
    }
    AppDynamicsQueryCtrl.prototype.getSegmentPathUpTo = function (index) {
        var arr = this.metricSegments.slice(0, index);
        var segments = '';
        for (var i = 0; i < arr.length; i++) {
            segments += arr[i].value + '|';
        }
        return segments;
    };
    AppDynamicsQueryCtrl.prototype.appChanged = function () {
        this.target.application = this.applicationSegment.value;
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
                return _this.uiSegmentSrv.newSegment({ value: segment.name, expandable: segment.type === 'folder' });
            });
            return segments;
        };
    };
    AppDynamicsQueryCtrl.templateUrl = 'partials/query.editor.html';
    return AppDynamicsQueryCtrl;
}(sdk_1.QueryCtrl));
exports.AppDynamicsQueryCtrl = AppDynamicsQueryCtrl;
