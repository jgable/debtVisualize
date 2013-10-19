/*global define, describe, beforeEach, afterEach, it*/

define([
    'backbone',
    'sinon',
    'models/Loan',
    'collections/Loan',
    'models/Strategy',
    'models/SnowballStrategy',
    'collections/Strategy'
], function (Backbone, sinon, LoanModel, LoanCollection, StrategyModel, SnowballStrategyModel, StrategyCollection) {
    'use strict';

    describe('Strategies', function () {
        var strategy,
            snowballStrategy,
            highInterestStrategy,
            strategies,
            loans,
            sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();

            strategy = new StrategyModel({
                name: 'Test'
            });

            snowballStrategy = new SnowballStrategyModel({
                snowball: 20.00
            });

            highInterestStrategy = new SnowballStrategyModel({
                focus: '-interest',
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
                interest: 16.0,
                payment: 11
            })]);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('can sort loans by focus', function () {
            var loan = loans.at(0),
                loan2 = loans.at(1),
                loan3 = loans.at(2);

            // Snowball sorts by amount
            var result = loans.sortBy(function (loan) {
                return snowballStrategy.sortLoansBy(loan);
            });

            result[0].should.equal(loan2);
            result[1].should.equal(loan3);
            result[2].should.equal(loan);

            // Highest interest sorts by -interest
            result = loans.sortBy(function (loan) {
                return highInterestStrategy.sortLoansBy(loan);
            });

            result[0].should.equal(loan3);
            result[1].should.equal(loan2);
            result[2].should.equal(loan);
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

        it('can apply highest interest payments', function () {
            var loan = loans.at(0),
                loan2 = loans.at(1),
                loan3 = loans.at(2);

            highInterestStrategy.applyPayment(loans);
            loan.get('amount').should.equal(994);
            loan2.get('amount').should.equal(490);
            loan3.get('amount').should.equal(669);

            highInterestStrategy.applyPayment(loans);
            loan.get('amount').should.equal(988);
            loan2.get('amount').should.equal(480);
            loan3.get('amount').should.equal(638);
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
});