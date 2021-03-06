/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/common',
    'templates'
], function ($, _, Backbone, Views, JST) {
    'use strict';

    var StrategiesView,
        StrategyItemView;

    StrategyItemView = Views.TemplateView.extend({
        className: 'strategy col-sm-6 col-md-4',
        template: JST.StrategyItem,

        events: {
            'keyup #snowball': 'updateSnowball',
            'change #snowball': 'updateSnowball',
            'input #snowball': 'updateSnowball',
            'change #focusAmount,#focusInterest': 'updateFocus',
            'submit form': 'suppressForm'
        },

        getTemplateData: function () {
            var data = this.model.toJSON();

            data['is' + this.model.getTemplatePartName()] = true;

            if (data.focus) {
                data.focusAmount = !!data.focus.match(/amount/g);
            }

            return data;
        },

        updateSnowball: _.throttle(function () {
            this.model.set('snowball', parseInt(this.$('#snowball').val(), 10));
        }, 1000, { leading: false, trailing: false }),

        updateFocus: function (ev) {
            var $radio = $(ev.currentTarget);

            this.model.set({focus: $radio.val()});
        },

        suppressForm: function (ev) {
            if (ev) {
                ev.preventDefault();
            }

            return false;
        }
    });

    StrategiesView = Views.CollectionView.extend({
        template: JST.Strategies,
        itemView: StrategyItemView,
        itemContainer: function () {
            return this.$('.strategies');
        }
    });

    return StrategiesView;
});