/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var PaybackvisualizationModel = Backbone.Model.extend({
        defaults: {
            loans: null,
            strategies: null
        }
    });

    return PaybackvisualizationModel;
});