import { QueryCtrl } from 'app/plugins/sdk';

export class AppDynamicsQueryCtrl extends QueryCtrl {

    static templateUrl = 'partials/query.editor.html';

    scope: any;
    uiSegmentSrv: any;

    constructor($scope, $injector, uiSegmentSrv)  {
        console.log($injector);
        super($scope, $injector);

        this.target.target = this.target.target;
        this.target.type = this.target.type;
        this.scope = $scope;
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
