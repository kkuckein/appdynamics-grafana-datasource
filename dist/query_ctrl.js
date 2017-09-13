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
            // If the user is editing a Folder segment, we delete the ones after it. Unless the user typed a '*'
            if (segmentIndex < _this.metricSegments.length - 1 && metricSegment.value !== '*') {
                _this.metricSegments.length = segmentIndex + 1;
            }
            // Only add a new one if it is the last and it is not a Leaf.
            if (segmentIndex === _this.metricSegments.length - 1 && metricSegment.expandable) {
                _this.metricSegments.push(_this.uiSegmentSrv.newSelectMetric());
            }
            // If this is a Leaf, we don't need the segments after it.
            if (segmentIndex < _this.metricSegments.length - 1 && !metricSegment.expandable) {
                _this.metricSegments.length = segmentIndex + 1;
            }
            _this.target.metric = _this.metricSegments.map(function (segment) { return segment.value; }).join('|');
            _this.panelCtrl.refresh();
        };
        _this.uiSegmentSrv = uiSegmentSrv;
        _this.appD = _this.datasource.appD;
        if (_this.target) {
            _this.parseTarget();
        }
        _this.getApplicationNames = function (query) {
            return _this.appD.getApplicationNames(query)
                .then(_this.transformToSegments(false));
        };
        _this.getMetricNames = function (index) {
            return _this.appD.getMetricNames(_this.target.application, _this.getSegmentPathUpTo(index))
                .then(_this.transformToSegments(false));
        };
        console.log(_this);
        return _this;
    }
    AppDynamicsQueryCtrl.prototype.parseTarget = function () {
        var _this = this;
        this.metricSegments = [];
        this.target.transformLegendText = '1';
        this.applicationSegment = this.uiSegmentSrv.newSegment(this.target.application || 'Application');
        if (this.target.metric) {
            this.target.metric.split('|').forEach(function (element, index, arr) {
                var expandable = true;
                if (index === arr.length - 1) {
                    expandable = false;
                }
                var newSegment = _this.uiSegmentSrv.newSegment({ value: element, expandable: expandable });
                _this.metricSegments.push(newSegment);
            });
        }
        else {
            this.metricSegments = [this.uiSegmentSrv.newSelectMetric()];
        }
    };
    AppDynamicsQueryCtrl.prototype.getSegmentPathUpTo = function (index) {
        var arr = this.metricSegments.slice(0, index);
        var segments = '';
        arr.forEach(function (element) {
            segments += element.value + '|';
        });
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
