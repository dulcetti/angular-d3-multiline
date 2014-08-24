'use strict';

/**
 * @ngdoc directive
 * @description
 * # d3MultiLine
 * tipHeight - offset from top for chart, to show tooltip inside chart area
 * tipClass - css class of tooltip box
 * titleTipClass - css class of tooltip text
 * lineColors - array of colors for lines (will be iterated)
 * pointRadius - radius of points
 * pointClass - css class of points
 * axisOffsetX, Y - offsets for X and Y axis
 * lineWidth - width of lines
 * interpolation - type of lines smoothing. Good explanation with examples can be found here: http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
 * labelFormatter - function will be called on tooltip rendering (on mouseover) and should return text (html) for label.
 *  otherwise, label will be compiled from fields 'label' and 'value' (if field 'label' is defined)
 *  as 'label: value', or just from given value, if 'label' is not declared.
 * ngModel - data for chart. Should be in format:
 *  {
 *    values:[
 *        points: [
 *            labels: [
 *                'Locke',
 *                'Reyes',
 *                'Ford',
 *                'Jarrah',
 *                'Shephard',
 *                'Kwon'
 *              ]
 *            values: [
 *                4,
 *                8,
 *                15,
 *                16,
 *                23,
 *                42
 *              ]
 *          ]
 *        title: 'Title of each point, will be on x axis'
 *      ]
 *    yAxisTitle: 'y axis'
 *  }
 */
angular.module('oz.d3Multiline', [])
  .directive('ozD3Multiline', function (D3ChartSizer, ColorIterator) {
    var sizer = new D3ChartSizer();

    function setDefaults(attrs) {
      attrs.pointRadius = attrs.pointRadius || '3';
      attrs.lineWidth = attrs.lineWidth || '1.5px;';
      attrs.tipHeight = attrs.tipHeight || '10';
      attrs.interpolation = attrs.interpolation || 'basis';
    }

    function draw(svg, scope, colorGenerator) {
      svg.selectAll('g').remove();
      var data = scope.ngModel;
      var margin = {top: parseInt(scope.tipHeight), right: 1, bottom: 0, left: 0, yAxisOffset: 0, yAxisWidth: 0, xAxisOffset: 0};
      if (data.yAxisTitle) {
        margin.yAxisOffset = parseInt(scope.yAxisOffset) || 20;
        margin.yAxisWidth = 10;
      }
      var xAxisTitles = _.pluck(data.values, 'title');
      if (xAxisTitles) {
        margin.xAxisOffset = parseInt(scope.xAxisOffset) || 20;
      }
      var width = scope.width, height = scope.height;
      var chart = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + parseInt(margin.left + margin.yAxisOffset + margin.yAxisWidth) + ',' + parseInt(margin.top) + ')');
      width = parseInt(width) - margin.left - margin.right - margin.yAxisOffset - margin.yAxisWidth;
      height = height - margin.top - margin.bottom - margin.xAxisOffset;

      var points = _.pluck(data.values, 'points');
      var values = _.flatten(_.flatten(points), 'values');
      var y = d3.scale.linear().range([height, 0]).domain([0, d3.max(values)]);
      var tip = d3.tip()
        .attr('class', scope.tipClass)
        .offset([-10, 0])
        .html(function (d) {
          var label;
          if (angular.isFunction(scope.labelFormatter)) {
            label = scope.labelFormatter(d);
          }
          if (label === undefined) {
            if (d.label) {
              label = d.label + ': ' + d.value;
            }
            else {
              label = d.value;
            }
          }
          if (label === undefined) {
            label = d;
          }
          return '<span class="' + scope.titleTipClass + '">' + label + '</span>';
        });
      svg.call(tip);
      var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
      var x1 = d3.scale.ordinal();

      x0.domain(_.map(data.values, function (d) {return d.title; }));
      x1.domain(points).rangeRoundBands([0, x0.rangeBand()]);

      if (xAxisTitles) {
        var xAxis = d3.svg.axis()
          .scale(x0)
          .orient("bottom");
        svg.append("g")
          .attr("class", "x axis")
          .attr('transform', 'translate(' + parseInt(margin.yAxisOffset + margin.yAxisWidth) + ',' + parseInt(height + margin.top + 2) + ')')
          .call(xAxis);
      }
      if (data.yAxisTitle) {
        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .ticks(5, '');

        svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + parseInt(margin.yAxisOffset) + ',' + margin.top + ')')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 5)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(data.yAxisTitle);
      }

      var barWidth = (width)/points.length;
      var linesValues = [];
      angular.forEach(points, function (point) {
        angular.forEach(point[0].values, function (v, i) {
          if (!linesValues[i]) {
            linesValues[i] = [];
          }
          linesValues[i].push({
            x:     ((linesValues[i].length)*barWidth + barWidth/2),
            y:     y(v),
            label: point[0].labels[i],
            value: v
          });
        });
      });

      colorGenerator.reset();

      angular.forEach(linesValues, function (lv) {
        var line = d3.svg.line()
          .interpolate(scope.interpolation)
          .x(function (d) { return d.x; })
          .y(function (d) { return d.y; });

        chart.append("path")
          .datum(lv)
          .attr('stroke-width', scope.lineWidth)
          .attr('fill', 'none')
          .attr('stroke', colorGenerator.getColor())
          .attr('d', line);

        chart.selectAll('d-d-circle')
          .data(lv)
          .enter()
          .append('circle')
          .attr('r', scope.pointRadius)
          .attr('class', scope.pointClass)
          .attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
      });

    }

    return {
      restrict: 'E',
      scope:    {
        ngModel:        '=',
        tipClass:       '@',
        tipHeight:      '@',
        titleTipClass:  '@',
        lineColors:     '=',
        pointRadius:    '@',
        pointClass:     '@',
        labelFormatter: '&',
        axisOffsetX:    '@',
        axisOffsetY:    '@',
        lineWidth:      '@',
        interpolation:  '@'
      },
      compile:  function (el, attrs) {
        setDefaults(attrs);
        return {
          post: function (scope, element) {
            var cGen = new ColorIterator();
            if (scope.lineColors) {
              cGen.setColors(scope.lineColors);
            }
            var svg = d3.select(angular.element(element)[0]).append('svg');

            function redraw() {
              scope.height = false;
              scope.width = false;
              sizer.setSizes(scope, element.parent());
              draw(svg, scope, cGen);
            }

            scope.$watch('ngModel', function () {
              if (scope.ngModel !== undefined) {
                redraw();
              }
            }, true);

            if (!scope.resizeWatching) {
              scope.resizeWatching = true;
              $(window).resize(function () {
                redraw();
              });
            }
          }
        };
      }
    };
  });
