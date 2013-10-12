/*global require, mocha, describe, beforeEach, afterEach, it*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        highcharts: {
            deps: ['jquery'],
            exports: '$.highcharts'
        },
        moment: {
            exports: 'moment'
        },
        sinon: {
            exports: 'sinon'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: 'vendor/bootstrap',
        // Can't use bower handlebars because it has a require optimizer bug
        handlebars: 'vendor/handlebars',
        d3: '../bower_components/rickshaw/vendor/d3.v2',
        rickshaw: '../bower_components/rickshaw/rickshaw',
        highcharts: '../bower_components/highcharts/highcharts',
        moment: '../bower_components/moment/moment',
        sinon: 'vendor/sinon'
    }
});

require([
    'backbone',
    'sinon',
    'models/Loan',
    'collections/Loan',
    'models/Strategy',
    'models/SnowballStrategy',
    'collections/Strategy'
], function (Backbone, sinon, LoanModel, LoanCollection, StrategyModel, SnowballStrategyModel, StrategyCollection) {
    describe('RequireJS', function () {
        it('is setup for the tests', function () {
            return;
        });
    });

    describe('Loans', function () {
        var loan,
            loans,
            sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();

            loan = new LoanModel({
                name: 'Test',
                amount: 1000.00,
                interest: 4.5,
                payment: 6
            });

            loans = new LoanCollection([loan]);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('can get the decimal version of the interest', function () {
            loan.interestDecimal().should.equal(0.045);
        });

        it('can calculate period interest', function () {
            loan.calculatePeriodInterest(30).should.equal(3.7);
        });

        it('can apply interest', function () {
            var interestApplied = loan.applyInterest(30);
            
            interestApplied.should.equal(3.7);

            loan.get('amount').should.equal(1000 + interestApplied);
        });

        it('can apply a payment', function () {
            // Should pay regular payments
            var paymentMade = loan.makePayment(10);
            paymentMade.should.equal(10);
            loan.get('amount').should.equal(990.00);

            // Should pay only amount left
            paymentMade = loan.makePayment(1000);
            paymentMade.should.equal(990);
            loan.get('amount').should.equal(0);
        });

        it('can clone', function () {
            var newLoans,
                changedCount = 0;

            loan.on('change', function () {
                changedCount += 1;
            });

            newLoans = loans.clone();

            newLoans.at(0).on('change', function () {
                changedCount += 1;
            });

            newLoans.at(0).makePayment(10);

            changedCount.should.equal(1);

            loans.at(0).makePayment(10);

            changedCount.should.equal(2);
        });

        it('can amortize', function () {
            var data = loans.amortize(30, new StrategyModel());

            data.length.should.equal(261);
            data[data.length-1].totals.amount.should.equal(0);
        });

        it('throws an error when negatively amortizing', function () {
            loan.set('amount', 7000.00);

            var amortizeLoan = function () {
                loans.amortize(30, new StrategyModel());
            };

            amortizeLoan.should.throw('Cannot have a negatively amortized loan, increase minimum payments');
        });

        it('can serialize data for a url', function () {
            var serialized = loan.serializeForUrl(),
                otherLoan = new LoanModel({
                    name: 'Other',
                    amount: 2000,
                    interest: 2.5,
                    payment: 5.1
                });

            serialized.should.equal('Test|1000|4.5|6');

            loan.set('name', 'Something with a space');

            serialized = loan.serializeForUrl();

            serialized.should.equal('Something+with+a+space|1000|4.5|6');

            loans.add(otherLoan);

            serialized = loans.serializeForUrl();

            serialized.should.equal('Something+with+a+space|1000|4.5|6&Other|2000|2.5|5.1');
        });

        it('can load from serialized url', function () {
            var serializedLoan = LoanModel.fromSerializedUrl('Something+with+a+space|1000|4.5|6');

            serializedLoan.get('name').should.equal('Something with a space');
            serializedLoan.get('amount').should.equal(1000);
            serializedLoan.get('interest').should.equal(4.5);
            serializedLoan.get('payment').should.equal(6);

            serializedLoan = LoanCollection.fromSerializedUrl('Something+with+a+space|1000|4.5|6&Other|2000|2.5|5.1');

            serializedLoan.length.should.equal(2);

            serializedLoan.at(0).get('name').should.equal('Something with a space');
            serializedLoan.at(0).get('amount').should.equal(1000);
            serializedLoan.at(0).get('interest').should.equal(4.5);
            serializedLoan.at(0).get('payment').should.equal(6);

            serializedLoan.at(1).get('name').should.equal('Other');
            serializedLoan.at(1).get('amount').should.equal(2000);
            serializedLoan.at(1).get('interest').should.equal(2.5);
            serializedLoan.at(1).get('payment').should.equal(5.1);
        });
    });

    describe('Strategies', function () {
        var strategy,
            snowballStrategy,
            strategies,
            loans,
            sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();

            strategy = new StrategyModel({
                name: 'Test'
            });

            snowballStrategy = new SnowballStrategyModel({
                name: 'Snowball',
                snowball: 20.00
            });

            strategies = new StrategyCollection([strategy, snowballStrategy]);

            loans = new LoanCollection([new LoanModel({
                name: 'Test 1',
                amount: 1000.00,
                interest: 4.5,
                payment: 6
            }), new LoanModel({
                name: 'Test 2',
                amount: 500.00,
                interest: 15.0,
                payment: 10
            }), new LoanModel({
                name: 'Test 3',
                amount: 700.00,
                interest: 12.0,
                payment: 11
            })]);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('can apply minimum payments', function () {
            var loan = loans.at(0),
                loan2 = loans.at(1);

            strategy.applyPayment(loans);
            loan.get('amount').should.equal(994.00);
            loan2.get('amount').should.equal(490.00);

            strategy.applyPayment(loans);
            loan.get('amount').should.equal(988.00);
            loan2.get('amount').should.equal(480.00);
        });

        it('can apply snowball payments', function () {
            var loan = loans.at(0),
                loan2 = loans.at(1),
                loan3 = loans.at(2);

            snowballStrategy.applyPayment(loans);
            loan.get('amount').should.equal(994);
            loan2.get('amount').should.equal(470);
            loan3.get('amount').should.equal(689);

            snowballStrategy.applyPayment(loans);
            loan.get('amount').should.equal(988);
            loan2.get('amount').should.equal(440);
            loan3.get('amount').should.equal(678);
        });

        it('can serialize data for a url', function () {
            var serialized = strategy.serializeForUrl();

            serialized.should.equal('Test');

            serialized = snowballStrategy.serializeForUrl();

            serialized.should.equal('Snowball|20');

            serialized = strategies.serializeForUrl();

            serialized.should.equal('Test&Snowball|20');
        });

        it('can load from url data', function () {
            var serializedStrat = StrategyModel.fromSerializedUrl('Minimum+Payment');

            serializedStrat.get('name').should.equal('Minimum Payment');

            serializedStrat = StrategyCollection.fromSerializedUrl('Test&Snowball|22.25');

            serializedStrat.length.should.equal(2);

            serializedStrat.at(0).get('name').should.equal('Test');

            serializedStrat.at(1).get('name').should.equal('Snowball');
            serializedStrat.at(1).get('snowball').should.equal(22.25);
        });
    });

    mocha.run();
});
