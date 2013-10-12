/*global define, localStorage */

define([
    'underscore',
    'models/DebtVisualizerPage',
    'collections/Loan',
    'collections/Strategy',
    'models/Strategy',
    'models/SnowballStrategy',
    'models/PaybackVisualization'
], function (_, DebtVisualizerPageModel, LoanCollection, StrategyCollection, StrategyModel, SnowballStrategyModel, PaybackVisualizationModel) {
    'use strict';

    var storageKey = 'pageData';

    return {
        saveToLocalStorage: function (model) {
            if (!window.localStorage) {
                return;
            }

            var loansData = model.get('loans').toJSON(),
                strategiesData = model.get('strategies').toJSON(),
                storedData = {
                    loans: loansData,
                    strategies: strategiesData
                };

            localStorage.setItem(storageKey, JSON.stringify(storedData));
        },

        loadFromLocalStorage: function () {
            if (!window.localStorage) {
                return;
            }
            
            var storedData = localStorage.getItem(storageKey),
                loans,
                strategies;

            if (!storedData) {
                return false;
            }

            try {
                storedData = JSON.parse(storedData);
            } catch (ignore) {
                return false;
            }

            // Convert to the appropriate Strategy Model
            storedData.strategies = _(storedData.strategies).map(function (strategyData) {
                if (strategyData.name === 'Snowball') {
                    return new SnowballStrategyModel(strategyData);
                }

                return new StrategyModel(strategyData);
            });

            loans = new LoanCollection(storedData.loans);
            strategies = new StrategyCollection(storedData.strategies);

            return new DebtVisualizerPageModel({
                loans: loans,
                strategies: strategies,
                visualization: new PaybackVisualizationModel({
                    loans: loans,
                    strategies: strategies
                })
            });
        }
    };
});