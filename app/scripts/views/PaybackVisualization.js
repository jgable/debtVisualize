/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/common',
    'models/Strategy',
    'highcharts',
    'moment',
    'templates'
], function ($, _, Backbone, Views, StrategyModel, Highcharts, moment, JST) {
    'use strict';

    function roundNumberTwoDecimals(num) {
        return +(Math.round(num + 'e+2')  + 'e-2');
    }

    var MinPaymentStrategyModel = StrategyModel.extend({

        // The default strategy implementation is Min Payment only

    });

    var PaybackvisualizationView = Views.SubViewableView.extend({
        template: JST.PaybackVisualization,

        initialize: function () {
            this.listenTo(this.model.get('loans'), 'change', this.renderGraph);
            this.listenTo(this.model.get('strategies'), 'change', this.renderGraph);

            Views.SubViewableView.prototype.initialize.apply(this, arguments);
        },

        afterRender: function () {
            var self = this;

            // Defer this until after this view has been appended to the DOM 
            // so the calculated width is correct
            _.defer(function () {
                self.renderGraph();
            });
        },

        renderGraph: function () {
            var $graph = this.$('#graph'),
                loans = this.model.get('loans'),
                periodDays = 30,
                minPaymentStrategy = new MinPaymentStrategyModel(),
                // TODO: Multiple strategies selection
                amortizationData = [{
                    data: loans.amortize(periodDays, minPaymentStrategy),
                    strategy: minPaymentStrategy
                }, {
                    data: loans.amortize(periodDays, this.model.get('strategies').at(0)),
                    strategy: this.model.get('strategies').at(0)
                }],
                plotLookup = {},
                series = _(amortizationData).map(function (datum) {
                    var seriesName = datum.strategy.get('name'),
                        seriesData = {
                            // TODO: Colors based on bootstrap theme
                            name: seriesName,
                            // Map out the data from the amortize info
                            data: _.map(datum.data, function (plot, i) {
                                var id = [seriesName, i].join('-'),
                                    point;
                                
                                // Keep this around so we can look up the data later for tooltips
                                plotLookup[id] = plot;

                                point = {
                                    x: i,
                                    y: roundNumberTwoDecimals(plot.totals.amount),
                                    id: id
                                };

                                // If there was an event on this point (paid off loan), highlight it in the graph
                                if (plot.events && plot.events.length > 0) {
                                    point.marker = {
                                        enabled: true,
                                        fillColor: '#5B5'
                                    };
                                }

                                return point;
                            })
                        };

                    return seriesData;
                });

            $graph.highcharts({
                chart: {
                    type: 'area'
                },
                title: {
                    style: {
                        display: 'none'
                    }
                },
                xAxis: {
                    labels: {
                        formatter: function () {
                            if (this.value === 0) {
                                return 'Today';
                            }

                            return moment().add('M', this.value).format('MMMM, YYYY');
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Debt Amount'
                    },
                    labels: {
                        formatter: function () {
                             /*jslint bitwise: true*/
                            return ((this.value / 1000)|0) + 'k';
                             /*jslint bitwise: false*/
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var plotData = plotLookup[this.point.id],
                            titleDateStr = moment().add('M', plotData.period).format('MMMM, YYYY'),
                            content = '';

                        content += '<span>' + titleDateStr + '</span><br/>';
                            
                        if (plotData.events && plotData.events.length > 0) {
                            content += _.map(plotData.events, function (eventContent) {
                                var duration = moment.duration(plotData.period, 'M'),
                                    dateStr = '';

                                if (duration.years()) {
                                    dateStr += duration.years() + ' Years';
                                }

                                if (duration.months()) {
                                    if (dateStr.length > 0) {
                                        dateStr += ', ' + duration.months() + ' Months';
                                    } else {
                                        dateStr += duration.months() + ' Months';
                                    }
                                }

                                if (dateStr.length < 1) {
                                    dateStr += duration.asDays() + ' Days';
                                }

                                return '<span>' + eventContent + ' in ' + dateStr + '</span><br/>';
                            }).join('');
                        }

                        content += '<strong><span>$' + roundNumberTwoDecimals(plotData.loans.sumPayment) + '</span><span> in Total Payments</span></strong><br/>' +
                            '<span> - $' + roundNumberTwoDecimals(plotData.loans.sumInterest) + '</span><span> interest</span><br/>' +
                            '<span> - $' + roundNumberTwoDecimals(plotData.loans.sumPrincipal) + '</span><span> principal</span><br/>';

                        return content;
                    }
                },
                plotOptions: {
                    area: {
                        pointStart: 0,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: series
            });
        }
    });

    return PaybackvisualizationView;
});