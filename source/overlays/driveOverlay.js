/*
Copyright (c) 2019 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){
  var conductor = require('./../conductor.js');
  var overlays = require('./overlays.js');
  var dso = require('./deviceScanOverlay.js');
  var slideControl = require('slideControl.js');
  // var chart = require('chart.js');
  var dov = {};

  dov.start = function() {

    overlays.insertHTML("<svg id='driveOverlay' xmlns='http://www.w3.org/2000/svg'></svg>");

  //  This will cause iPhone to drag the screen<div>
  //    <canvas id="myChart" style="position:absolute; top:100px; left:250px;" width="400" height="200"></canvas>
  //  </div>

    dov.svg = document.getElementById('driveOverlay');
    dov.lSlide = new slideControl.Class(dov.svg, 'L');
    dov.rSlide = new slideControl.Class(dov.svg, 'R');

    //dov.chartSetup();
    dov.sendValuesToBot();
  };

 /*
 dov.chartSetup = function() {
    // console.log('hack a chart');
    var ctx = document.getElementById('myChart').getContext('2d');
    ctx.canvas.width = 400;
    ctx.canvas.height = 200;

    // The X axis is catagory based not linear. This allows points to be added
    // without the need to change X
    let bufferWidth = 50;
    var x1Points = [];
    var x2Points = [];
    var xLabels = [];
    for (var x = 0; x <  bufferWidth; x++) {
      x1Points.push((x % 10) * 10);
      x2Points.push((x % 5) * -10);
      xLabels.push('');
    }

    // Add end points, that can be used but the x axis.
    xLabels[2] = 'xMin';
    xLabels[bufferWidth-1] = 'xMax';

    // Notice the scaleLabel at the same level as Ticks
    var options = {
      scales: {
                xAxes: [{ gridLines: { lineWidth: 3 } }],
                yAxes: [{
                    gridLines: { lineWidth: 2 },
                    ticks: {
                        beginAtZero:true,
                    },
                    scaleLabel: {
                         display: true,
                         labelString: 'Moola',
                         fontSize: 20
                      }
                }]
            }
    };

    var data2 = {
          labels: xLabels,
          datasets: [{
              label: "M1",
              fill: false,
              lineTension: 0,
              pointRadius: 0,
              data: x1Points,
            }, {
              label: "M2",
              fill: false,
              lineTension: 0,
              pointRadius: 0,
              data: x2Points,
            }
          ]
        };

    var opt2 = {
        // animation: false,
        animation: { easing:'linear' },
        scales: {
          yAxes: [{
            ticks: {
              min: -100,
              max: 100
            }
          }],
          xAxes: [{
            ticks: {
              display: false,
              min: 'xMin',
              max: 'xMax'
            }
          }]
        }
    };

    dov.chart = new Chart(ctx, {
      type: 'line',
      data: data2,
    options: opt2});
    dov.chart.canvas.style.height = '400px';
    dov.chart.canvas.style.width = '600px';
 };
*/

  dov.resize = function() {
    var t = dov;
    t.w = t.svg.clientWidth;
    t.h = t.svg.clientHeight;

    // Clear out the old.
    while (t.svg.lastChild) {
        t.svg.removeChild(t.svg.lastChild);
    }

    var w = t.w;
    var h = t.h;
    t.scaleH = 1.0;
    t.scaleW = 1.0;
    if ( w < 500 ) {
        if ( w < 200) {
            w = 200;
        }
        t.scaleW = (w / 500);
    }

    if ( h < 500 ) {
        if ( h < 200) {
            h = 200;
        }
        t.scaleH = (h / 500);
    }

    var top = 100 * t.scaleH;
    var width = 120 *  Math.min(t.scaleH, t.scaleW);
    var gwHalf = width / 2;
    var gInsetW = 80 * t.scaleW;

    t.lSlide.buildSvg(gInsetW + gwHalf, width, top, h, t.scaleH);
    t.rSlide.buildSvg(w - gInsetW - gwHalf, width, top, h, t.scaleH);
  };

  dov.chartUpdate = function() {
    var v1 = dov.lSlide.vvalue.value;
    var v2 = dov.rSlide.vvalue.value;
    console.log('updateChart');
    dov.chart.data.datasets.forEach((dataset) => {
      dataset.data.shift();
      dataset.data.push(v1);
    });
    dov.chart.update();
  };

  dov.sendValuesToBot = function() {
    var id = dso.deviceName;
    var t = dov;

    if (id !== null && id !== dso.nonName) {
      //console.log(t.lSlide.vvalue.value);
      if (t.lSlide.vvalue.value !== 0) {
        var message2 = '(m:1 d:' + (-t.lSlide.vvalue.value) + ');';
        conductor.cxn.write(id, message2);
      }
      if (t.rSlide.vvalue.value !== 0) {
        var message1 = '(m:2 d:' + (-t.rSlide.vvalue.value) + ');';
        conductor.cxn.write(id, message1);
      }
      t.lSlide.vvalue.sync();
      t.rSlide.vvalue.sync();
    }
/*
    var accel = document.getElementsByClassName("drive-accelerometer")[0];
    accel.innerHTML = "Accelerometer:" + cxn.accelerometer;

    var compass = document.getElementsByClassName("drive-compass")[0];
    compass.innerHTML = "Compass:" + cxn.compass;

    var temp = document.getElementsByClassName("drive-temperature")[0];
    temp.innerHTML = "Temperature:" + cxn.temp;
*/
    dov.timer = setTimeout( function() {
      // dov.updateChart();
      dov.sendValuesToBot();
    }, 50);
  };

  // Close the dov overlay.
  dov.exit = function() {
    clearTimeout(dov.timer);
  };

  return dov;
}();
