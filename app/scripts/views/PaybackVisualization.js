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

    var PaybackvisualizationView = Views.SubViewableView.extend({
        template: JST.PaybackVisualization,
        descriptionTemplate: _.template('By sticking to the <%= bestStrategy %> strategy you will pay off your debt <strong><%= timeSaved %></strong> faster and pay <strong>$<%= amountSaved %></strong> less.'),

        initialize: function () {
            var loans = this.model.get('loans'),
                strategies = this.model.get('strategies');

            // Throttle the rendering of the graph for when we reset from url data
            this.renderGraph = _.throttle(this._renderGraph, 1200, {
                leading: false,
                trailing: false
            });

            this.listenTo(loans, 'change add remove reset', this.renderGraph, this);
            this.listenTo(strategies, 'change add remove reset', this.renderGraph, this);

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

        _renderGraph: function () {
            var self = this,
                $graph = this.$('#graph'),
                // TODO: Multiple strategies selection
                amortizationData = this.getStrategyAmortizationData(),
                // Filled up with data in the getPlotsFromAmortizationData
                plotLookup = {},
                series = this.getPlotsFromAmortizationData(amortizationData, plotLookup);

            // Update the blurb about payoff.
            this.updateDescription(amortizationData);

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
                        var plotData = plotLookup[this.point.id];
                        
                        return self.getPlotPointTooltip(plotData);
                    }
                },
                plotOptions: {
                    area: {
                        pointStart: 0,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 5,
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
        },

        updateDescription: function (amortizationData) {
            var periodDays = this.model.get('periodDays'),
                savedDays,
                amountSaved,
                bestStrategy,
                worstStrategy,
                descriptionData,
                descriptionContent;

            _(amortizationData).each(function (datum) {
                if (!bestStrategy || bestStrategy.data.length > datum.data.length) {
                    bestStrategy = datum;
                }

                if (!worstStrategy || worstStrategy.data.length < datum.data.length) {
                    worstStrategy = datum;
                }
            });

            savedDays = (worstStrategy.data.length - bestStrategy.data.length) * periodDays;
            amountSaved = (_(worstStrategy.data).last().totals.payment - _(bestStrategy.data).last().totals.payment);

            descriptionData = {
                bestStrategy: bestStrategy.strategy.get('name'),
                timeSaved: moment.duration(savedDays, 'd').humanize(),
                amountSaved: amountSaved.toFixed(2)
            };

            descriptionContent = this.descriptionTemplate(descriptionData);

            this.$('.description').html(descriptionContent);
        },

        getStrategyAmortizationData: function () {
            var periodDays = this.model.get('periodDays'),
                loans = this.model.get('loans');

            return this.model.get('strategies').map(function (strategy) {
                return {
                    data: loans.amortize(periodDays, strategy),
                    strategy: strategy
                };
            });
        },

        getPlotsFromAmortizationData: function (amortizationData, plotLookup) {
            plotLookup = plotLookup || {};

            return _(amortizationData).map(function (datum) {
                var seriesName = datum.strategy.get('name'),
                    seriesData = {
                        // TODO: Colors based on bootstrap theme
                        name: seriesName,
                        // Map out the data from the amortize info
                        data: _(datum.data).map(function (plot, i) {
                            var id = [seriesName, i].join('-'),
                                point;
                            
                            // Keep this around so we can look up the data later for tooltips
                            plotLookup[id] = plot;

                            point = {
                                x: i,
                                y: roundNumberTwoDecimals(plot.totals.amount),
                                id: id,
                                marker: {
                                    enabled: false,
                                    radius: 5,
                                    states: {
                                        hover: {
                                            enabled: true,
                                            radius: 5
                                        }
                                    }
                                }
                            };

                            // If there was an event on this point (paid off loan), highlight it in the graph
                            if (plot.events && plot.events.length > 0) {
                                point.marker = {
                                    enabled: true,
                                    fillColor: '#5B5',
                                    radius: 5,
                                    states: {
                                        hover: {
                                            fillColor: '#5B5',
                                            radius: 5
                                        }
                                    }
                                };

                                
                            }

                            return point;
                        })
                    };

                return seriesData;
            });
        },

        getPlotPointTooltip: function (plotData) {
            var titleDateStr = moment().add('M', plotData.period).format('MMMM, YYYY'),
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
    });

    return PaybackvisualizationView;
});