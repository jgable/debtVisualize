/*global define*/
define([
	'underscore'
	'backbone'
], function (_, Backbone) {
	'use strict';

	var DebtVisualizePageRouter = Backbone.Router.extend({
		routes: {
			'loans/:loanData': 'loadLoans',
			'loans/:loanData/strategies/:strategyData' : 'loadLoansAndStrategies'
		},

		loadLoans: function (loanData) {
			
		},

		loadLoansAndStrategies: function (loanData, strategyData) {

		}
	});

	return DebtVisualizePageRouter;
});