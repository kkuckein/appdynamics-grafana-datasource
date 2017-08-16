import angular from 'angular';
import { QueryCtrl } from 'app/plugins/sdk';

export class AppDynamicsQueryCtrl extends QueryCtrl {

    static templateUrl = 'partials/query.editor.html';
    appD: any;
    getApplicationNames: any;
    getMetricNames: any;
    transformLegendOptions: object[];

    applicationSegment: any;
    // metricSegment: any;

    metricPath: string[];

    constructor($scope, $injector, private $q, private uiSegmentSrv, private templateSrv)  {
        super($scope, $injector);

        this.uiSegmentSrv = uiSegmentSrv;
        this.appD = this.datasource.appD;

        this.target.application = this.target.application || 'Application';
        this.applicationSegment = uiSegmentSrv.newSegment(this.target.application);


        this.getApplicationNames = (query) => {
            return this.appD.getApplicationNames(query)
            .then(this.transformToSegments(false));
        };

        this.getMetricNames = (query, callback) => {
            this.appD.getMetricNames(this.target.application, query)
            .then(callback);
        };

    }

    appChanged() {
        this.target.application = this.applicationSegment.value;
        this.panelCtrl.refresh();
    }

    metricChanged() {
        this.target.metric = this.metricSegment.value;
        this.panelCtrl.refresh();
    }

    toggleEditorMode() {
        this.target.rawQuery = !this.target.rawQuery;
    }

    onChangeInternal() {
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }

    transformToSegments(addTemplateVars) {

        return (results) => {

            const segments = results.map( (segment) => {
                return this.uiSegmentSrv.newSegment({ value: segment });
            });
            return segments;
        };
  }

}
