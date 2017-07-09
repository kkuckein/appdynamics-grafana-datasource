import angular from 'angular';
import { QueryCtrl } from 'app/plugins/sdk';

export class AppDynamicsQueryCtrl extends QueryCtrl {

    static templateUrl = 'partials/query.editor.html';

    constructor($scope, $injector, private $q, private uiSegmentSrv, private templateSrv)  { //Hmm what
        super($scope, $injector);

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
