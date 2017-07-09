"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("app/plugins/sdk");
class AppDynamicsQueryCtrl extends sdk_1.QueryCtrl {
    constructor($scope, $injector, $q, uiSegmentSrv, templateSrv) {
        super($scope, $injector);
        this.$q = $q;
        this.uiSegmentSrv = uiSegmentSrv;
        this.templateSrv = templateSrv;
        this.uiSegmentSrv = uiSegmentSrv;
    }
    getOptions(query) {
        // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
        return this.datasource.metricFindQuery(query || '')
            .then(this.uiSegmentSrv.transformToSegments(false));
    }
    toggleEditorMode() {
        this.target.rawQuery = !this.target.rawQuery;
    }
    onChangeInternal() {
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
}
AppDynamicsQueryCtrl.templateUrl = 'partials/query.editor.html';
exports.AppDynamicsQueryCtrl = AppDynamicsQueryCtrl;
