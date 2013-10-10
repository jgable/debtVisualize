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
        tagName: 'li',
        className: 'strategy',

        template: JST.StrategyItem
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