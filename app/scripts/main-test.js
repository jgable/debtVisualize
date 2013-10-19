/*global require, mocha*/
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
        },
        sinon: {
            exports: 'sinon'
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
        moment: '../bower_components/moment/moment',
        sinon: 'vendor/sinon'
    }
});

require([
    'spec/Misc',
    'spec/Loans',
    'spec/Strategies'
], function () {
    if (window.mochaPhantomJS) {
        window.mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});
