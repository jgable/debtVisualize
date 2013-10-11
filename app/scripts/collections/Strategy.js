/*global define*/

define([
    'underscore',
    'backbone',
    'models/Strategy',
    'models/SnowballStrategy'
], function (_, Backbone, StrategyModel, SnowballStrategyModel) {
    'use strict';

    var StrategyCollection = Backbone.Collection.extend({
        model: StrategyModel
    }, {
        makeDefault: function () {
            return new StrategyCollection([
                new StrategyModel(),
                new SnowballStrategyModel({
                    name: 'Snowball',
                    snowball: 20.00,
                    selected: true
                })
            ]);
        }
    });

    return StrategyCollection;
});