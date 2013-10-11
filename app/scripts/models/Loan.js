/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var LoanModel = Backbone.Model.extend({
        defaults: {
            name: null,
            amount: null,
            interest: null,
            payment: null,
            yearDays: 365,
            hasChanges: false
        },

        interestDecimal: function () {
            // Get the value of the interest rate in decimal form
            return this.get('interest') / 100;
        },

        calculatePeriodInterest: function (periodDays) {
            return LoanModel.roundNumberTwoDecimals(((this.get('amount') * this.interestDecimal()) / this.get('yearDays')) * periodDays);
        },

        applyInterest: function (periodDays) {
            var periodInterest = this.calculatePeriodInterest(periodDays),
                newAmount = this.get('amount') + periodInterest;
            
            this.set('amount', newAmount);

            return periodInterest;
        },

        makePayment: function (paymentAmount) {
            var amount = this.get('amount');

            if (amount < paymentAmount) {
                paymentAmount = amount;
            }

            this.set('amount', amount - paymentAmount);

            return paymentAmount;
        }
    }, {
        roundNumberTwoDecimals: function (num) {
            return +(Math.round(num + 'e+2')  + 'e-2');
        }
    });

    return LoanModel;
});