/*global define*/
define([
    'underscore',
    'backbone',
    'models/DebtVisualizerPage',
    'models/PaybackVisualization',
    'collections/Loan',
    'collections/Strategy',
    'views/DebtVisualizerPage',
    'utility/persistence',
], function (_, Backbone, DebtVisualizerPageModel, PaybackVisualizationModel, LoanCollection, StrategyCollection, DebtVisualizerPageView, persistence) {
    'use strict';

    var DebtVisualizePageRouter = Backbone.Router.extend({
        routes: {
            '': 'default',
            'loans/:loanData': 'loans',
            'loans/:loanData/strategies/:strategyData' : 'loansAndStrategies'
        },

        default: function () {
            var loans,
                strategies,
                persistedPageData = persistence.loadFromLocalStorage();

            if (persistedPageData) {
                loans = persistedPageData.get('loans');
                strategies = persistedPageData.get('strategies');
            } else {
                loans = LoanCollection.makeDefault();
                strategies = StrategyCollection.makeDefault();
            }

            this.renderPage(loans, strategies);
        },

        loans: function (loanData) {
            var loans = LoanCollection.fromSerializedUrl(loanData),
                strategies = StrategyCollection.makeDefault();

            this.renderPage(loans, strategies);
        },

        loansAndStrategies: function (loanData, strategyData) {
            var loans = LoanCollection.fromSerializedUrl(loanData),
                strategies = StrategyCollection.fromSerializedUrl(strategyData);

            this.renderPage(loans, strategies);
        },

        renderPage: function (loans, strategies) {
            // If we already have a rendered view (hitting back button)
            // just update its model.
            if (this.currentView) {
                this.currentView.model.get('loans').reset(loans.models);
                this.currentView.model.get('strategies').reset(strategies.models);

                return;
            }

            var self = this,
                pageModel = new DebtVisualizerPageModel({
                    loans: loans,
                    strategies: strategies,
                    visualization: new PaybackVisualizationModel({
                        loans: loans,
                        strategies: strategies
                    })
                }),
                view = new DebtVisualizerPageView({
                    el: '#main',
                    model: pageModel
                });

            this.currentView = view;

            view.on('permalink', function () {
                var loanData = pageModel.get('loans').serializeForUrl(),
                    strategyData = pageModel.get('strategies').serializeForUrl();

                self.navigate(['loans', loanData, 'strategies', strategyData].join('/'), {
                    replace: true
                });
            });

            view.render();
        }
    });

    return DebtVisualizePageRouter;
});