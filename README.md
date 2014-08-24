AngularJS directive to draw D3 line chart with multiple lines
=============================================================
##Attributes

 - tipHeight - offset from top for chart, to show tooltip inside chart area
 - tipClass - css class of tooltip box
 - titleTipClass - css class of tooltip text
 - lineColors - array of colors for lines (will be iterated)
 - pointRadius - radius of points
 - pointClass - css class of points
 - axisOffsetX, Y - offsets for X and Y axis
 - lineWidth - width of lines
 - interpolation - type of lines smoothing. Good explanation with examples can be found here: http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
 - labelFormatter - function will be called on tooltip rendering (on mouseover) and should return text (html) for label. Otherwise, label will be compiled from fields 'label' and 'value' (if field 'label' is defined) as 'label: value', or just from given value, if 'label' is not declared.
 - ngModel - data for chart. Should be in format:
```
  {
    values:[
        points: [
            labels: [
                'Locke',
                'Reyes',
                'Ford',
                'Jarrah',
                'Shephard',
                'Kwon'
              ]
            values: [
                4,
                8,
                15,
                16,
                23,
                42
              ]
          ]
        title: 'Title of each point, will be on x axis'
      ]
    yAxisTitle: 'y axis'
  }
```