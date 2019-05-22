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

  variables.vars = {
    'A': {'rw':true, 'source':'variable'},
    'B': {'rw':true, 'source':'variable'},
    'C': {'rw':true, 'source':'variable'},
    /*
    'Accel': {'rw':false, 'source':'sensor'},
    'Gyro': {'rw':false, 'source':'sensor'},
    'M1': {'rw':false, 'source':'actor'},
    'M2': {'rw':false, 'source':'actor'},
    'E1': {'rw':false, 'source':'sensor'},
    'E2': {'rw':false, 'source':'sensor'},
    'F1': {'rw':false, 'source':'function'},
    'F2': {'rw':false, 'source':'function'},
    */
  };

  variables.addOptions = function(selectObj, selectedOption) {

    var index = 0;
    for (var key in variables.vars) {
      var option = document.createElement("option");
      option.text = key;
      option.value = key;
      selectObj.add(option);

      if (key === selectedOption) {
        selectObj.selectedIndex = index;
      }
      index += 1;
    }
  };

  variables.getSelected = function(selectObj) {
    var index = selectObj.selectedIndex;
    var item = selectObj.options[index];
    console.log("selected item", item.value);
    return item.value;
    };

  variables.Var = function Var () {
    this.value = 0;
    this.lastValue = 0;
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

  variables.Var.prototype.get = function() {
    return this.value;
  };

  variables.Var.prototype.hasChanged = function() {
    return (this.value !== this.lastValue);
  };

  variables.Var.prototype.sync = function() {
    this.lastValue = this.value;
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

  variables.v['L'].setMinMax(-100,100);
  variables.v['R'].setMinMax(-100,100);

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

  variables.get = function (vname) {
    return variables.v[vname].get();
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
