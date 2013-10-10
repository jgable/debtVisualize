/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        d3: {
            exports: 'd3'
        },
        rickshaw: {
            deps: ['jquery', 'd3'],
            exports: 'Rickshaw'
        },
        highcharts: {
            deps: ['jquery'],
            exports: '$.highcharts'
        },
        moment: {
            exports: 'moment'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: 'vendor/bootstrap',
        handlebars: '../bower_components/handlebars/handlebars',
        d3: '../bower_components/rickshaw/vendor/d3.v2',
        rickshaw: '../bower_components/rickshaw/rickshaw',
        highcharts: '../bower_components/highcharts/highcharts',
        moment: '../bower_components/moment/moment'
    }
});

require([
    'backbone',
    'models/DebtVisualizerPage',
    'views/DebtVisualizerPage'
], function (Backbone, DebtVisualizerPageModel, DebtVisualizerPageView) {
    Backbone.history.start();

    window.APP = new DebtVisualizerPageView({
        el: '#main'
    }).render();
});
