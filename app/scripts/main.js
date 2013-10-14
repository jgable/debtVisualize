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
        highcharts: '../bower_components/highcharts/highcharts',
        moment: '../bower_components/moment/moment'
    }
});

require([
    'backbone',
    'router'
], function (Backbone, DebtVisualizationAppRouter) {
    // Store it on the window global in case I need it in the future.
    window.APP_ROUTER = new DebtVisualizationAppRouter();

    Backbone.history.start({
        // Not using pushState because there is no server to handle the different routes
        pushState: false
    });
});
