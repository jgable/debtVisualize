/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'utility/persistence',
    'models/DebtVisualizerPage',
    'collections/Loan',
    'collections/Strategy',
    'models/PaybackVisualization',
    'views/common',
    'views/Loans',
    'views/Strategies',
    'views/PaybackVisualization'
], function ($, _, Backbone, persistence, DebtVisualizerPageModel, LoanCollection, StrategyCollection, PaybackVisualizationModel, Views, LoansView, StrategiesView, PaybackVisualizationView) {
    'use strict';

    var DebtVisualizerPageView = Views.SubViewableView.extend({

        initialize: function (attrs) {
            attrs = attrs || {};

            var loans = new LoanCollection([{
                    name: 'Loan #1',
                    amount: 5000.00,
                    interest: 3.1,
                    payment: 110.00
                }, {
                    name: 'Loan #2',
                    amount: 10000.00,
                    interest: 5.5,
                    payment: 75.00
                }]),
                strategies = StrategyCollection.makeDefault(),
                persistedPageData = persistence.loadFromLocalStorage();

            this.model = this.model || persistedPageData || new DebtVisualizerPageModel({
                loans: loans,
                strategies: strategies,
                visualization: new PaybackVisualizationModel({
                    loans: loans,
                    strategies: strategies
                })
            });

            this.listenTo(this.model.get('loans'), 'change:name change:amount change:interest change:payment add remove', this.saveDataToLocalStorage);
            this.listenTo(this.model.get('strategies'), 'change add remove', this.saveDataToLocalStorage);

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
        },

        saveDataToLocalStorage: function () {
            persistence.saveToLocalStorage(this.model);
        }
    });

    return DebtVisualizerPageView;
});