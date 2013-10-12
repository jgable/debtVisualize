/*global define, escape*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var StrategyModel = Backbone.Model.extend({
        defaults: {
            name: 'Minimum Payment',
            description: 'Pay the minimum payment on all loans until they are paid off.',
            selected: false
        },

        getTemplatePartName: function () {
            return this.get('name').replace(' ', '_');
        },

        applyPayment: function (loans) {
            // Iterates through each loan and makes a payment

            // By default, just make the minimum payment on each loan
            return loans.map(function (loan) {
                return loan.makePayment(loan.get('payment'));
            });
        },

        setExtraPlotData: function () {
            // Set no extra data
        },

        serializeForUrl: function () {
            return StrategyModel.encodeValueForUrl(this.get('name'));
        }
    }, {
        // TODO: Move to utility file
        encodeValueForUrl: function (str) {
            return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, '%2A').replace(/%20/g, '+');
        },

        // TODO: Move to utility file
        decodeValueFromUrl: function (str) {
            return decodeURIComponent(str).replace(/\+/g, ' ');
        },

        fromSerializedUrl: function (str) {
            return new StrategyModel({
                name: StrategyModel.decodeValueFromUrl(str)
            });
        }
    });

    return StrategyModel;
});