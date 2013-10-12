/*global define, escape*/

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
        },

        serializeForUrl: function () {
            var encode = LoanModel.encodeValueForUrl;

            return _([this.get('name'), this.get('amount'), this.get('interest'), this.get('payment')]).map(encode).join('|');
        }
    }, {
        // TODO: Move to utility file
        roundNumberTwoDecimals: function (num) {
            return +(Math.round(num + 'e+2')  + 'e-2');
        },
        // TODO: Move to utility file
        encodeValueForUrl: function (str) {
            return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, '%2A').replace(/%20/g, '+');
        },
        // TODO: Move to utility file
        decodeValueFromUrl: function (str) {
            return decodeURIComponent(str).replace(/\+/g, ' ');
        },

        fromSerializedUrl: function (urlPart) {
            var parts = urlPart.split('|'),
                name = this.decodeValueFromUrl(parts[0]),
                amount = parseFloat(this.decodeValueFromUrl(parts[1]), 10) || 0,
                interest = parseFloat(this.decodeValueFromUrl(parts[2]), 10) || 0,
                payment = parseFloat(this.decodeValueFromUrl(parts[3]), 10) || 0;

            return new LoanModel({
                name: name,
                amount: amount,
                interest: interest,
                payment: payment
            });
        }
    });

    return LoanModel;
});