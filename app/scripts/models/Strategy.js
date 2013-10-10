/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var StrategyModel = Backbone.Model.extend({
        defaults: {
            name: 'Minimum Payment',
            selected: false
        },

        applyPayment: function (loans) {
            // Iterates through each loan and makes a payment

            // By default, just make the minimum payment on each loan
            return loans.map(function (loan) {
                var paymentAmount = loan.get('payment');

                return loan.makePayment(paymentAmount);
            });
        }
    });

    return StrategyModel;
});