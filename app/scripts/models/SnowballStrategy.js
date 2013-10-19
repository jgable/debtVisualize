/*global define*/

define([
    'underscore',
    'backbone',
    'models/Strategy',
    'models/SortedLoanPaymentStrategy'
], function (_, Backbone, StrategyModel, SortedStrategyModel) {
    'use strict';

    var SnowballStrategyModel = SortedStrategyModel.extend({
        defaults: {
            name: 'Snowball',
            description: 'Pay off lowest balance loans first and add their minimum payment to your subsequent payments.',
            focus: 'amount',
            snowball: 0.00
        },

        sortLoansBy: function (loan) {
            var focus = this.get('focus') || 'amount',
                direction = 1;

            if (focus.slice(0, 1) === '-') {
                direction = -1;
                focus = focus.slice(1);
            }

            return direction * loan.get(focus);
        },

        setExtraPlotData: function (plot) {
            _.extend(plot, {
                snowball: this.get('snowball')
            });
        },

        serializeForUrl: function () {
            return _([this.get('name'), this.get('snowball')]).map(StrategyModel.encodeValueForUrl).join('|');
        }
    }, {
        fromSerializedUrl: function (str) {
            var parts = str.split('|'),
                name = StrategyModel.decodeValueFromUrl(parts[0]),
                snowball = parseFloat(StrategyModel.decodeValueFromUrl(parts[1]), 10);

            return new SnowballStrategyModel({
                name: name,
                snowball: snowball
            });
        }
    });

    return SnowballStrategyModel;
});