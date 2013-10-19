/*global define*/

define([
    'underscore',
    'backbone',
    'models/Strategy',
    'models/SnowballStrategy'
], function (_, Backbone, StrategyModel, SnowballStrategyModel) {
    'use strict';

    var StrategyCollection = Backbone.Collection.extend({
        model: StrategyModel,

        serializeForUrl: function () {
            return this.invoke('serializeForUrl').join('&');
        }
    }, {
        makeDefault: function () {
            return new StrategyCollection([
                new StrategyModel(),
                new SnowballStrategyModel({
                    snowball: 20.00,
                    selected: true
                })
            ]);
        },

        fromSerializedUrl: function (urlPart) {
            var stratModels = _.map(urlPart.split('&'), function (part) {
                var parts = part.split('|');

                if (parts[0] === 'Snowball') {
                    return SnowballStrategyModel.fromSerializedUrl(part);
                }

                return StrategyModel.fromSerializedUrl(part);
            });

            return new StrategyCollection(stratModels);
        }
    });

    return StrategyCollection;
});