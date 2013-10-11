/*global define*/

define([
    'underscore',
    'backbone',
    'models/Strategy'
], function (_, Backbone, StrategyModel) {
    'use strict';

    var SnowballStrategyModel = StrategyModel.extend({
        defaults: {
            name: 'Snowball',
            description: 'Pay off lowest balance loans first and add their minimum payment to your subsequent payments on loans.',
            selected: false,
            snowball: 0.00
        },

        applyPayment: function (loans) {
            var payments = [],
                sortedLoans,
                snowball = this.get('snowball'),
                snowballExtra = 0;

            // Order loans by least amount
            sortedLoans = loans.sortBy(function (loan) {
                return loan.get('amount');
            });

            payments = _(sortedLoans).reduce(function (memo, loan) {
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

                    // Add the left over to the snowball
                    snowball += (min - amount);

                    // Pay off the loan
                    payment = loan.makePayment(payment);

                    // Update the snowball amount to include the paid off loans minimum
                    snowballExtra += min;

                    // Bug out for next loan
                    memo[loan.cid] = payment;
                    return memo;
                }

                payment = min + snowball;

                // If the snowball and min cover the amount left.
                if (payment > amount) {
                    // Keep the left over on the snowball
                    snowball = payment - amount;
                    // Pay off the remaining
                    payment = amount;
                } else {
                    // Applying all the snowball to the loan
                    snowball = 0;
                }

                payment = loan.makePayment(payment);

                // If we paid off the loan, add the payment to the snowball.
                if (loan.get('amount') <= 0) {
                    snowballExtra += min;
                }

                memo[loan.cid] = payment;
                return memo;
            }, {});

            // Increase the size of the snowball if we paid off any loans
            if (snowballExtra) {
                this.set('snowball', this.get('snowball') + snowballExtra);
            }

            // Make sure we return the payments array in the same order that we got it in.
            return loans.map(function (loan) {
                return payments[loan.cid];
            });
        },

        setExtraPlotData: function (plot) {
            _.extend(plot, {
                snowball: this.get('snowball')
            });
        },

        serializeForUrl: function () {
            return _([this.get('name'), this.get('snowball')]).map(StrategyModel.encodeValueForUrl).join('|');
        }
    });

    return SnowballStrategyModel;
});