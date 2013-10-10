/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/DebtVisualizerPage',
    'collections/Loan',
    'collections/Strategy',
    'models/PaybackVisualization',
    'views/common',
    'views/Loans',
    'views/Strategies',
    'views/PaybackVisualization'
], function ($, _, Backbone, DebtVisualizerPageModel, LoanCollection, StrategyCollection, PaybackVisualizationModel, Views, LoansView, StrategiesView, PaybackVisualizationView) {
    'use strict';

    var DebtVisualizerPageView = Views.SubViewableView.extend({

        initialize: function (attrs) {
            var loans = new LoanCollection({
                    name: 'Loan #1',
                    amount: 5000.00,
                    interest: 4.5,
                    payment: 30.00
                }),
                strategies = StrategyCollection.makeDefault();

            this.model = attrs.model || new DebtVisualizerPageModel({
                loans: loans,
                strategies: strategies,
                visualization: new PaybackVisualizationModel({
                    loans: loans,
                    strategies: strategies
                })
            });

            Views.SubViewableView.prototype.initialize.call(this, attrs);
        },
        
        afterRender: function () {
            var LoansSub = new LoansView({
                    collection: this.model.get('loans')
                }),
                StrategiesSub = new StrategiesView({
                    collection: this.model.get('strategies')
                }),
                VisualizationSub = new PaybackVisualizationView({
                    model: this.model.get('visualization')
                });

            this.appendSubview('Loans', LoansSub);
            this.appendSubview('Strategies', StrategiesSub);
            this.appendSubview('Visualization', VisualizationSub);
        }
    });

    return DebtVisualizerPageView;
});