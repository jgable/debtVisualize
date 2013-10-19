/*global define*/

define([
    'underscore',
    'backbone',
    'models/Strategy'
], function (_, Backbone, StrategyModel) {
    'use strict';

    var SortedLoanPaymentStrategyModel = StrategyModel.extend({
        sortLoansBy: function (loan) {
            return loan.get('amount');
        },

        applyPayment: function (loans) {
            var self = this,
                payments = [],
                sortedLoans;

            // Order loans by least amount
            sortedLoans = loans.sortBy(function (loan) {
                return self.sortLoansBy(loan);
            });

            // Make the payments least amount
            payments = this.makePayments(sortedLoans);

            // Make sure we return the payments array in the same order that we got it in.
            return loans.map(function (loan) {
                return payments[loan.cid];
            });
        },

        getExtraPeriodPaymentAmount: function () {
            return this.get('snowball');
        },

        handlePaidOffLoan: function (loan) {
            // Add the minimum to the snowball to be applied to next period payments
            this.set('snowball', this.get('snowball') + loan.get('payment'));
        }
        
    });

    return SortedLoanPaymentStrategyModel;
});