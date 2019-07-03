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

module.exports = function () {
    var svgb = require('./../svgbuilder.js');
    var interact = require('interact.js');
    var ko = require('knockout');
    var icons = require('icons.js');
    var calcpad = {};
    var expr = {};

// An expression capture the operator/operand tree
//  fix:  infix | prefix | postfix
//  fxn:  function name. Variable and literals evalueate to simple functions
//  flex: legal set of options allowed by the editor
//        integer, real, boolean, variable, io variable, string?

// In this case the data is kept simple and the algorithms are visitors.
    var infixOpMap = {
      'assign': ':=',
      'increment': '+=',
      'decrement': '-=',
      'scale': '*=',
      'divscale': '/=',
      'add': '+',
      'subtract': '-',
      'divide': '/',
      'multiply': '*',
      'rshift': '>>',
      'lshift': '<<',
      'mod': '%',
      'greater' : '>',
      'greater-equal' : '≥',
      'equal' : '=',
      'not-equal' : '≠',
      'less-equal' : '≤',
      'less' : '<',
//      'and' : '∧',
//      'or' : '∨',
      'and' : '&',
      'or' : '|',
      'xor' : '⊕',
    };

    var sampleExpr = {
      cat: 'infixop',
      name: 'decrement',
      flex: 'assign|increment|decrement',
      args: [
        {
          cat: 'variable',
          name: 'A',
          flex: 'variable'
        }, {
          cat: 'integer',
          name: '0',
          flex: 'integer|variable'
        }
      ],
    };

    calcpad.argExists = function(e, i) {
      return (e.args !== undefined && e.args[i] !== undefined);
    };

    // Caculate bounding boxes for elements of the epxression
    calcpad.calcExprPlacements = function(e, left) {

      // Start out with all infix notation
      if (calcpad.argExists(e, 0))
        left = calcpad.calcExprPlacements(e.args[0], left);

      e.boxLeft = left;
      if (e.cat === 'variable') {
        // Might allow for longer names
        left += 70;
      } else if (e.cat === 'integer') {
        // Might allow for longer numbers and negatives
        left += 50;
      } else if (e.cat === 'boolean') {
        // Might allow for longer numbers and negatives
        left += 40;
      } else if (e.cat === 'infixop') {
        // Migth be one or two characters
        left += 50;
      }

      // This nodes left is for the fxn, not the whole expression.
      e.boxRight = left;

      if (calcpad.argExists(e, 1))
        left = calcpad.calcExprPlacements(e.args[1], left);

      return left;
    };

    calcpad.buildExprSvg = function(e, svg, top, height) {
      var obj = null;

      if (calcpad.argExists(e, 0))
        calcpad.buildExprSvg(e.args[0], svg, top, height);

      // In the back is th object that actually get the click events.
      // class will be added/removed to highlight the expression.
      var left = e.boxLeft;
      var right = e.boxRight;
      console.log('rect bounds', e, left, top + 6, right-left, height);
      e.boxObj = svgb.createRect('expr-region', left, top, right-left, height);
      e.boxObj.setAttribute('name', e.name); //Just for now.
      svg.appendChild(e.boxObj);

      if (e.cat === 'variable') {
        obj = icons.variable(0.7, left + 15, top + 1, e.name);
        svg.appendChild(obj);
      } else if (e.cat === 'integer') {
        obj = svgb.createText('svg-clear vars-bottom-txt', left + 20, top+22, e.name);
        obj.setAttribute('text-anchor', 'middle');
        svg.appendChild(obj);
      } else if (e.cat === 'boolean') {
        obj = svgb.createText('svg-clear vars-bottom-txt', left + 20, top+22, e.name);
        obj.setAttribute('text-anchor', 'middle');
        svg.appendChild(obj);
      } else if (e.cat === 'infixop') {
        let opString = infixOpMap[e.name];
        obj = svgb.createText('svg-clear vars-bottom-txt', left + 20, top+22, opString);
        obj.setAttribute('text-anchor', 'middle');
        svg.appendChild(obj);
      }

      if (calcpad.argExists(e, 0))
        calcpad.buildExprSvg(e.args[1], svg, top, height);
    };

    calcpad.clearSvg = function(e, svg) {

    }

    calcpad.highlightExprSvg = function(e) {

    }

    calcpad.configKeyBoard = function(e, svg) {
      if (e.cat === 'variable') {
        calcpad.addVarKeypad(svg);
      } else if (e.cat === 'integer') {
        // can also allow for ooching.
        calcpad.addNumberKeypad(svg);
      } else if (e.cat === 'boolean') {
        // true false
        calcpad.addVarKeypad(svg);
      } else if (e.cat === 'infixop') {
        // logic , equality., etc
        calcpad.addVarKeypad(svg);
//        calcpad.addOpKeypad(svg);
      }
    };

    calcpad.open = function(div, block) {
      calcpad.activeBlock = block; // Is this even needed ???
      div.innerHTML =
      `<div id='pictureEditorDiv' class='editorDiv'>
        <svg id='calcpadSvg' width=231px height=190px xmlns='http://www.w3.org/2000/svg'>
        </svg>
      </div>`;

      var svg = document.getElementById('calcpadSvg');

      // Expression layout - at the top level there are three Items
      // (1) the left target operand.
      // (2) the operan. method on left of AudioContext
      // (3) the paremete. For now thre is just one operand
      // based on what field is pressed. The key pad let it be filled in
      // layout.

      var xw = 226;
      var yh = 190;
      var displayh = 38;

      var group = svgb.createGroup('', 0, 0);
      var shell = svgb.createRect('calc-shell', 2, 2, xw, displayh, 4);
      var keybase = svgb.createRect('calc-keybase', 2, displayh + 3, xw, 145, 4);
      group.appendChild(shell);
      group.appendChild(keybase);
      svg.appendChild(group);

      calcpad.calcExprPlacements(sampleExpr, 30);
      calcpad.exprGroup = svgb.createGroup('', 0, 0);
      calcpad.buildExprSvg(sampleExpr, calcpad.exprGroup, 4, displayh - 4);
      svg.appendChild(calcpad.exprGroup);

      calcpad.configKeyBoard(sampleExpr, svg);
      calcpad.connectEvents(svg);
    };

    calcpad.connectEvents = function(svg) {
      interact('.calc-button', {context:svg} )
        .on('tap', function (event) {
          var strNum = event.target.getAttribute('name');
          console.log('calc-button ->', strNum);
        });

        interact('.expr-region', {context:svg} )
          .on('tap', function (event) {
            var strNum = event.target.getAttribute('name');
            console.log('expr-region ->', strNum);
          });


/*
      interact('.calcButtons', {context:svg})
        .on('tap', function (event) {
            // Get the clicked on button name
            var strNum = event.target.getAttribute('name');
        });
        */
    };

    calcpad.addVarKeypad = function(svg) {
      var baseX = 6;
      var dX = 56;
      var baseY = 42;
      var dY = 36;

      var labels = ['7', '8', '9', '+1', '4', '5', '6', '-1', '1', '2', '3', '+/-', '0', '0', '.', 'C'];

      var i = 0;
      for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
          var obj = icons.calcbutton(0.8,
            baseX + (x * dX),
            baseY + (y * dY),
            53, 34,
            labels[i],
            'calc-numbers');
          svg.appendChild(obj);
          i += 1;
        }
      }
    };
/*
     keypad.openTabs(div, object); //dataButton
      var beatsDisplay = document.getElementById('beats-display');
      var numericDisplay = document.getElementById('numeric-display');
      beatsDisplay.onclick = function(){
        var buttons = document.getElementsByClassName('dataButton');
        beatsDisplay.className += " selectedDisplay";
        numericDisplay.className = "numeric-display-half svg-clear";
        var buttonsLen = buttons.length;
        for(var i = 0; i < buttonsLen; i++){
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        var svg = document.getElementById('keypadSvg');
        svg.parentNode.removeChild(svg);
        keypad.openBeats(object);
      };

      numericDisplay.onclick = function(){
        var buttons = document.getElementsByClassName('beatsButton');
        numericDisplay.className += " selectedDisplay";
        beatsDisplay.className = "beats-display svg-clear";
        var buttonsLen = buttons.length;
        for(var i = 0; i < buttonsLen; i++){
          buttons[0].parentNode.removeChild(buttons[0]);
        }
        ko.cleanNode(div);
        keypad.tabbedButtons(object);
      };
      */

    calcpad.openTabs = function(div, object){
      // Get all the data from the parameter
      var block = object.block;
      var min = object.min;
      var max = object.max;
      var suffix = object.suffix;
      var blockType = object.type;
      var setValue = object.setValue;
      var getValue = object.getValue;
      var numArray = object.numArray;
      var calcLayout = object.calcLayout;
      if(object.inner === undefined){
        div.innerHTML =
            `<div id='keypadDiv' class='editorDiv'>
                <div id="numeric-display" class = "numeric-display svg-clear" width='80px' height='80px' data-bind='text: keyPadValue'>
                </div>
                <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
            </div>`;
      } else {
        div.innerHTML = object.inner;
      }

      ko.applyBindings(blockType, div);
      var display = document.getElementById("numeric-display");
      var keypadSvg = document.getElementById('keypadSvg');

      // Show the current data on the configuration panel
      var num = getValue().toString();
      blockType.keyPadValue(num.toString() + suffix);
      var strNum = "";

      // Create an editor state object for the interactions to work with.

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('dataButton', 0, 0);
            var box = svgb.createRect('calcButtons', 2.5+((ix)*75), 5+(iy*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 37.5+((ix)*75), 27.5+(iy*35), numArray[((iy)*3) + ix]);
            text.setAttribute('text-anchor', 'middle');

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            keypadSvg.appendChild(button);
          }
        }
      }

      // Interact on calcButtons
      // do on tap
      // Take event, make event.target
      // get characteristic of dom element

      interact('.calcButtons', {context:keypadSvg})
        .on('tap', function (event) {
            // Get the clicked on button name
            strNum = event.target.getAttribute('name');

            if(calcLayout === "simple"){ // If the layout is a simple layout
              var increment = "";
              display.classList.remove("error");

              // Check if you want to change the value
              // Store if we are going up or down and the number that follows
              if(strNum.substring(0,1) === "+" ||strNum.substring(0,1) === "-"){
                increment = strNum.substring(0,1);
                strNum = strNum.substring(1);
              }

              // If it is "<-" or "C", then delete current number
              if(strNum === "<-" || strNum === "C"){
                num = "0";
              }

              // If we are subtracting, subtract the number from variable num
              if(increment === "-"){
                if(parseInt(num, 10)-parseInt(strNum, 10) >= min){
                  num = (parseInt(num, 10)-parseInt(strNum, 10)).toString();
                } else {
                  num = min;
                  display.classList.add("error");
                }
              } else if(increment === "+"){ //Otherwise, add
                if(parseInt(num, 10)+parseInt(strNum, 10) <= max){
                  num = (parseInt(num, 10)+parseInt(strNum, 10)).toString();
                } else {
                  num = max;
                  display.classList.add("error");
                }
              }
            } else if(calcLayout === "complex"){ // If the layout is a complex layout
              var isNegate = strNum === "+/-";
              // If it is "<-" or "C", then delete current number
              if(strNum === "<-" || strNum === "C"){
                num = "0";
                display.classList.remove("error");
              } else if(isNegate && num !== "0"){ // Negate the number
                display.classList.remove("error");
                if(num.substring(0, 1) === "-"){
                  num = num.substring(1);
                } else {
                  num = "-" + num;
                }
              } else if(num === "0" && !isNegate){ // If the number is 0, replace it
                display.classList.remove("error");
                num = strNum;
                // If the number is going to be within the max and min, then add the new number on.
              } else if(parseInt(num + strNum, 10) <= max && parseInt(num + strNum, 10) >= min && !isNegate){
                num += strNum;
              } else if(!isNegate){ // If the number doesn't satisfy the conditions above, then it is an error
                display.classList.add("error");
              }
            } else if(calcLayout === "defined"){ // If the layout is a defined layout
              num = strNum; // Set num to strNum
            }

            // Now show the number on the config panel
            blockType.keyPadValue(num.toString() + suffix);
            // And update the block data
            setValue(num);
            block.updateSvg();


        });

      return;
    };

    calcpad.openBeats = function(object) {
      var getBeats = object.getBeats;
      var setBeats = object.setBeats;
      var blockType = object.type;
      var block = object.block;
      var numArray = object.beatsRay;

      if(numArray === undefined){
        numArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      }
      var beatsSvg = document.getElementById('beatsSvg');

      // Show the current data on the config panel
      var num = getBeats().toString();
      if(num === '1'){
        blockType.beatsValue(num.toString() + " beat");
      } else {
        blockType.beatsValue(num.toString() + " beats");
      }

      for (var iy = 0; iy < 4; iy++) {
        for (var ix = 0; ix < 3; ix++) {
          // Create each button
          if(numArray[((iy)*3) + ix] !== undefined){
            var button = svgb.createGroup('', 0, 0);
            var box = svgb.createRect('beatsButtons', 2.5+((ix)*75), 5+((iy)*35), 70, 30, 6);
            var text = svgb.createText('svg-clear', 37.5+((ix)*75), 27.5+((iy)*35), numArray[((iy)*3) + ix]);
            text.setAttribute('text-anchor', 'middle');

            button.appendChild(box);
            button.appendChild(text);

            box.setAttribute('name', numArray[((iy)*3) + ix]);

            beatsSvg.appendChild(button);
          }
        }
      }

      interact('.beatsButtons', {context:beatsSvg})
        .on('tap', function (event) {
          var strNum = event.target.getAttribute('name');

          num = strNum; // Set num to strNum

          // Now show the number on the config panel
          if(num === '1'){
            blockType.beatsValue(num.toString() + " beat");
          } else {
            blockType.beatsValue(num.toString() + " beats");
          }
          // And update the block data
          setBeats(num);
          block.updateSvg();
        });

    };

    calcpad.openTabsWithBeats = function(div, object) {
      object.inner =
          `<div id='keypadDiv' class='editorDiv'>
              <div id="numeric-display" class = "numeric-display-half svg-clear" width='80px' height='80px' data-bind='text: keyPadValue'>

              </div>
              <div id="beats-display" class = "beats-display svg-clear" width='80px' height='80px' data-bind='text: beatsValue'>

              </div>
              <svg id="keypadSvg" class='area' width='225px' height='72px' xmlns='http://www.w3.org/2000/svg'></svg>
              <svg id="beatsSvg" class='area' width='225px' height='80px' xmlns='http://www.w3.org/2000/svg'></svg>
          </div>`;
      calcpad.openTabs(div, object);
      object.beatsRay = ["1", "2", "3", "4", "5", "6"];
      calcpad.openBeats(object);
      };

    calcpad.close = function createKeyPad(div){
      ko.cleanNode(div);
    };
    return calcpad;
}();
