/*
Copyright (c) 2018 Trashbots

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

module.exports = function (){
  var variables = {};

  variables.a = 0;
  variables.b = 0;
  variables.c = 0;

  variables.increment = function(variable, val) {
    if(variable === 'A'){
      variables.a += val;
    } else if(variable === 'B'){
      variables.b += val;
    } if(variable === 'C'){
      variables.c += val;
    }
    console.log(variables.a, variables.b, variables.c);
  };

  variables.decrement = function(variable, val) {
    if(variable === 'A'){
      variables.a -= val;
    } else if(variable === 'B'){
      variables.b -= val;
    } if(variable === 'C'){
      variables.c -= val;
    }
    console.log(variables.a, variables.b, variables.c);
  };

  variables.incdec = function (variable, incdec, val) {
    var num = Math.abs(parseInt(val, 10));
    if(incdec === '+'){
      variables.increment(variable, num);
    } else if(incdec === '-'){
      variables.decrement(variable, num);
    }
  };

  variables.setVal = function(variable, val) {
    var num = parseInt(val, 10);
    if(variable === 'A'){
      variables.a = num;
    } else if(variable === 'B'){
      variables.b = num;
    } if(variable === 'C'){
      variables.c = num;
    }
    console.log(variables.a, variables.b, variables.c);
  };

  variables.resetVars = function() {
    variables.a = 0;
    variables.b = 0;
    variables.c = 0;
  };

  return variables;

}();
