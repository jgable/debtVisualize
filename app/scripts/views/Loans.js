/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/common',
    'templates'
], function ($, _, Backbone, Views, JST) {
    'use strict';

    var LoansView,
        LoanItemView;

    LoanItemView = Views.TemplateView.extend({
        tagName: 'li',
        className: 'loan row',

        template: JST.LoanItem,

        events: {
            'blur input': 'updateValues',
            'click .loan-remove': 'removeLoan'
        },

        inititialize: function () {
            // TODO: Validation errors
            this.listenTo(this.model, 'error', this.handleError);
        },

        updateValues: function () {
            var self = this;

            this.$('input').each(function () {
                var $this = $(this),
                    name = $this.attr('name'),
                    val = $this.val();

                if (name !== 'name') {
                    val = parseInt(val, 10);
                    if (isNaN(val)) {
                        $this.val(this.model.get(name));
                        return;
                    }
                }

                self.model.set(name, val);
            });
        },

        handleError: function (model) {
            console.log('LoanItem error', arguments, model);
        },

        removeLoan: function (ev) {
            ev.preventDefault();

            this.model.destroy();

            return false;
        }
    });

    LoansView = Views.CollectionView.extend({
        template: JST.Loans,
        itemView: LoanItemView,
        itemContainer: function () {
            return this.$('.loans');
        },

        events: {
            'click .loan-add': 'addLoan'
        },

        addLoan: function (ev) {
            if (ev) {
                ev.preventDefault();
            }

            this.collection.add([{
                name: 'Loan #' + (this.collection.length + 1),
                amount: 1000.00,
                interest: 1.0,
                payment: 10.00
            }]);

            return false;
        }

    });

    return LoansView;
});