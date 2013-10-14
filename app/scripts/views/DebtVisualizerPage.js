/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'utility/persistence',
    'models/DebtVisualizerPage',
    'collections/Loan',
    'collections/Strategy',
    'models/PaybackVisualization',
    'views/common',
    'views/Loans',
    'views/Strategies',
    'views/PaybackVisualization'
], function ($, _, Backbone, persistence, DebtVisualizerPageModel, LoanCollection, StrategyCollection, PaybackVisualizationModel, Views, LoansView, StrategiesView, PaybackVisualizationView) {
    'use strict';

    var DebtVisualizerPageView = Views.SubViewableView.extend({
        template: _.template('<a href="javascript:void(0);" class="pull-right btn btn-info" id="permalink">permalink</span>'),

        events: {
            'click #permalink': 'permalink'
        },

        initialize: function (attrs) {
            this.listenTo(this.model.get('loans'), 'change add remove reset', this.saveDataToLocalStorage);
            this.listenTo(this.model.get('strategies'), 'change add remove reset', this.saveDataToLocalStorage);

            Views.SubViewableView.prototype.initialize.call(this, attrs);
        },

        render: function () {
            var self = this,
                $loading = this.$('.loading');

            if ($loading.is(':visible')) {
                $loading.fadeOut('slow', function () {
                    Views.SubViewableView.prototype.render.apply(self, arguments);
                });

                return this;
            }

            return Views.SubViewableView.prototype.render.apply(this, arguments);
        },
        
        afterRender: function () {
            var LoansSub = new LoansView({
                    collection: this.model.get('loans')
                }),
                StrategiesSub = new StrategiesView({
                    collection: this.model.get('strategies')
                }),
                VisualizationSub = new PaybackVisualizationView({
                    model: this.model.get('visualization')
                });

            this.appendSubview('Loans', LoansSub);
            this.appendSubview('Strategies', StrategiesSub);
            this.appendSubview('Visualization', VisualizationSub);
        },

        saveDataToLocalStorage: function () {
            persistence.saveToLocalStorage(this.model);
            this.trigger('datasaved');
        },

        permalink: function () {
            this.trigger('permalink');
        }
    });

    return DebtVisualizerPageView;
});