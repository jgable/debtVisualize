/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var DebtVisualizerPageModel = Backbone.Model.extend({
        defaults: {
            loans: null,
            strategies: null,
            visualization: null
        }
    });

    return DebtVisualizerPageModel;
});