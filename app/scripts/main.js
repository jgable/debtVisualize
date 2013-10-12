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
        // Can't use bower handlebars because it has a require optimizer bug
        handlebars: 'vendor/handlebars',
        d3: '../bower_components/rickshaw/vendor/d3.v2',
        rickshaw: '../bower_components/rickshaw/rickshaw',
        highcharts: '../bower_components/highcharts/highcharts',
        moment: '../bower_components/moment/moment'
    }
});

require([
    'backbone',
    'router'
], function (Backbone, DebtVisualizationAppRouter) {
    window.APP_ROUTER = new DebtVisualizationAppRouter();

    Backbone.history.start({
        pushState: false
    });
});
