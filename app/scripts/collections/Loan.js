/*global define*/

define([
    'underscore',
    'backbone',
    'models/Loan'
], function (_, Backbone, LoanModel) {
    'use strict';

    var LoanCollection = Backbone.Collection.extend({
        model: LoanModel,

        amortize: function (periodDays, strategy) {
            return LoanCollection.getAmortizationData(this.clone(), strategy.clone(), periodDays);
        },

        totalAmount: function () {
            return _(this.models).reduce(function (sum, loan) {
                return sum + loan.get('amount');
            }, 0);
        },

        clone: function () {
            // Overridden to do individual model clone also
            
            var newModels = this.map(function (model) {
                return model.clone();
            });

            return new LoanCollection(newModels);
        },

        serializeForUrl: function () {
            return this.invoke('serializeForUrl').join('&');
        }
    }, {
        makeDefault: function () {
            return new LoanCollection([{
                name: 'Loan #1',
                amount: 5000.00,
                interest: 3.1,
                payment: 110.00
            }, {
                name: 'Loan #2',
                amount: 10000.00,
                interest: 5.5,
                payment: 75.00
            }]);
        },

        getAmortizationData: function (loans, strategy, periodDays) {
            var plots = [],
                period = 0,
                preAmount,
                value = loans.totalAmount(),
                prevPlot,
                newPlot,
                interestApplied,
                paymentApplied,
                applyLoanInterest = function (loan) {
                    return loan.applyInterest(periodDays);
                },
                sumValues = function (vals) {
                    return _.reduce(vals, function (memo, val) { return memo + val; }, 0);
                },
                calculatePrincipal = function (paymentApplied, interestApplied) {
                    return _(paymentApplied).map(function (paymentAmount, i) {
                        // NOTE: We are relying on strategies returning the payments in the order
                        // we passed them the loans
                        return paymentAmount - interestApplied[i];
                    });
                },
                paidOffLoansFilter = function (loan) {
                    var changedAttribs = loan.changedAttributes({
                        amount: true
                    });
                    
                    return changedAttribs && loan.previous('amount') !== 0 && loan.get('amount') === 0;
                },
                getPaidOffLoanEvents = function (loans) {
                    var paidOffLoans = loans.filter(paidOffLoansFilter);

                    return _(paidOffLoans).map(function (loan) {
                        return 'Paid off ' + loan.get('name');
                    });
                };

            // Create the initial plot
            prevPlot = {
                period: period,
                totals: {
                    amount: value,
                    interest: 0,
                    payment: 0
                },
                loans: {
                    sumPayment: 0,
                    sumInterest: 0,
                    sumPrincipal: 0,
                    interest: 0,
                    payment: 0,
                    principal: 0
                },
                events: []
            };

            strategy.setExtraPlotData(prevPlot);

            plots.push(prevPlot);

            while (value > 0) {

                // Grab the amount to test against later
                preAmount = loans.totalAmount();

                // Apply the interest for the current period
                interestApplied = loans.map(applyLoanInterest);

                // Apply the payment for this period
                paymentApplied = strategy.applyPayment(loans);

                // Get the remaining total amount on the loans
                value = loans.totalAmount();

                // Check for negatively amortizing loans
                if (value > preAmount) {
                    // error out
                    throw new Error('Cannot have a negatively amortized loan, increase minimum payments');
                }

                // Create the new plot using information from the previous plot
                newPlot = {
                    period: period,
                    totals: {
                        amount: value,
                        // interest: %,
                        // payment: $
                    },
                    loans: {
                        sumPayment: sumValues(paymentApplied),
                        sumInterest: sumValues(interestApplied),
                        // sumPrincipal: #
                        interest: interestApplied,
                        payment: paymentApplied,
                        principal: calculatePrincipal(paymentApplied, interestApplied)
                    },
                    events: getPaidOffLoanEvents(loans)
                };

                // Outside of the object so we don't do the sumValues twice
                newPlot.totals.interest = prevPlot.totals.interest + newPlot.loans.sumInterest;
                newPlot.totals.payment = prevPlot.totals.payment + newPlot.loans.sumPayment;

                // Outside of the object initializer because we don't want to repeat the .map call
                newPlot.loans.sumPrincipal = sumValues(newPlot.loans.principal);

                // Allow the strategy to add some extra plot data
                strategy.setExtraPlotData(prevPlot);

                plots.push(newPlot);

                // Keep this plot around for the next iteration
                prevPlot = newPlot;

                // Move on to the next period
                period += 1;
            }

            return plots;
        },

        fromSerializedUrl: function (urlPart) {
            var parts = urlPart.split('&'),
                loans = _(parts).map(function (part) {
                    return LoanModel.fromSerializedUrl(part);
                });

            return new LoanCollection(loans);
        }
    });

    return LoanCollection;
});