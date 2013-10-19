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

        getExtraPeriodPaymentAmount: function () {
            return 0;
        },

        makePayments: function (loans) {
            var self = this,
                periodExtra = this.getExtraPeriodPaymentAmount(),
                paidOffLoans = [],
                payments;

            payments = _(loans).reduce(function (memo, loan) {
                var min = loan.get('payment'),
                    amount = loan.get('amount'),
                    payment = min;

                if (amount <= 0) {
                    // Skip this loan if nothing left to pay
                    memo[loan.cid] = 0;

                    return memo;
                }

                // If the min payment will cover the amount left
                if (min > amount) {
                    payment = amount;

                    // Add the left over to the extra for the next loan
                    periodExtra += (min - amount);

                    // Pay off the loan
                    payment = loan.makePayment(payment);

                    // Add to the paid off loans for later
                    paidOffLoans.push(loan);

                    // Bug out for next loan
                    memo[loan.cid] = payment;
                    return memo;
                }

                payment = min + periodExtra;

                // If the periodExtra and min cover the amount left.
                if (payment > amount) {
                    // Keep the left over on the amount extra for next loan
                    periodExtra = payment - amount;
                    // Pay off the remaining
                    payment = amount;
                } else {
                    // Applying all the extra monies to the loan
                    periodExtra = 0;
                }

                payment = loan.makePayment(payment);

                // If we paid off the loan, add to the paid off loans for later
                if (loan.get('amount') <= 0) {
                    paidOffLoans.push(loan);
                }

                memo[loan.cid] = payment;
                return memo;
            }, {});

            // Allow the strategy to do something with the paid off loans this period
            _(paidOffLoans).each(function (loan) {
                self.handlePaidOffLoan(loan);
            });

            return payments;
        },

        handlePaidOffLoan: function () {
            // Do nothing with paid off loans
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