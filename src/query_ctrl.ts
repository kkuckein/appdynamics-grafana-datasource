import angular from 'angular';
import { QueryCtrl } from 'app/plugins/sdk';

export class AppDynamicsQueryCtrl extends QueryCtrl {

    static templateUrl = 'partials/query.editor.html';
    appD: any;
    getApplicationNames: any;
    getMetricNames: any;
    transformLegendOptions: object[];

    applicationSegment: any;
    metricSegments: any[];

    metricPath: string[];

    constructor($scope, $injector, private $q, private uiSegmentSrv, private templateSrv)  {
        super($scope, $injector);

        this.uiSegmentSrv = uiSegmentSrv;
        this.appD = this.datasource.appD;

        this.target.application = this.target.application || 'Application';
        this.applicationSegment = uiSegmentSrv.newSegment(this.target.application);

        // TODO - When copying, how to maintain the metrics?
        this.metricSegments = [this.uiSegmentSrv.newSelectMetric()];

        this.getApplicationNames = (query) => {
            return this.appD.getApplicationNames(query)
            .then(this.transformToSegments(false));
        };

        this.getMetricNames = (index) => {
            return this.appD.getMetricNames(this.target.application, this.getSegmentPathUpTo(index))
            .then(this.transformToSegments(false));
        };

    }

    metricSegmentValueChanged = (metricSegment, segmentIndex) => {
        // Only add a new one if it is the last and it is not a Leaf.
        if ( segmentIndex === this.metricSegments.length - 1 && metricSegment.expandable) {
            this.metricSegments.push(this.uiSegmentSrv.newSelectMetric());
        }

        // If this is a Leaf, we don't need the segments after it.
        if (segmentIndex < this.metricSegments.length - 1 && ! metricSegment.expandable ) {
            this.metricSegments.length = segmentIndex + 1;
        }

        this.target.metric = this.metricSegments.map( (segment) =>  segment.value).join('|');
        this.panelCtrl.refresh();
      }

    getSegmentPathUpTo(index) {
        const arr = this.metricSegments.slice(0, index);
        let segments = '';
        for (let i = 0; i < arr.length; i++) {
          segments += arr[i].value + '|';
        }
        return segments;
      }

    appChanged() {
        this.target.application = this.applicationSegment.value;
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
                return this.uiSegmentSrv.newSegment({ value: segment.name, expandable: segment.type === 'folder' });
            });
            return segments;
        };
  }

}
