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

module.exports = function (){
  var variables = {};

  variables.Var = function Var () {
    this.value = 0;
    this.min = null;
    this.max = null;
  };

  variables.Var.prototype.setMinMax = function(min, max) {
    this.min = min;
    this.max = max;
    this.pin();
  };

  variables.Var.prototype.increment = function(operand) {
    this.value += operand;
    this.pin();
  };

  variables.Var.prototype.decrement = function(operand) {
    this.value -= operand;
    this.pin();
  };

  variables.Var.prototype.set = function(operand) {
    this.value = parseInt(operand, 10);
    this.pin();
  };

  variables.Var.prototype.pin = function() {
    if (this.min !== null && this.value < this.min) {
      this.value = this.min;
    } else if (this.max !== null && this.value > this.max) {
      this.value = this.max;
    }
  };

  variables.v = {
    'A': new variables.Var(),
    'B': new variables.Var(),
    'C': new variables.Var(),
    'L': new variables.Var(),
    'R': new variables.Var()
  };

  variables.func = function (vname, f, val) {
    var v = variables.v[vname];
    if (v === undefined)
      return;
    var num = parseInt(val, 10);
    if(f === '+'){
      v.increment(num);
    } else if(f === '-'){
      v.decrement(num);
    }
  };

  variables.set = function(vname, val) {
    var v = variables.v[vname];
    if (v === undefined)
      return;
    v.set(val);
  };

  variables.printVars = function() {
    var varDump = '';
    for (var prop in variables.v) {
      if (variables.v.hasOwnProperty(prop)) {
        varDump = varDump + ", [" + prop + "]=" + variables.v[prop].value;
      }
    }
    console.log(varDump);
  };

  variables.resetVars = function() {
    for (var prop in variables.v) {
      if (variables.v.hasOwnProperty(prop)) {
        variables.v[prop].set(0);
      }
    }
  };

  return variables;
}();
