/*
Copyright (c) 2019 Paul Austin - SDG

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
  var log = {};

  log.buffer = "";

  log.traceHL = function() {
      var args = Array.prototype.slice.call(arguments);
     // args.unshift('t:');
      log.traceCore(args);
  };

  log.trace = function() {
      var args = Array.prototype.slice.call(arguments);
     // args.unshift('t:');
      log.traceCore(args);
  };

  log.error = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('e:');
      log.traceCore(args);
  };

  log.traceCore = function(args) {

      var message = "";
      var index = 0;
      for (; index < args.length; ++index) {
          message = message + args[index].valueOf() + " ";
      }
      message += "\n";
      log.buffer += message;

      console.log.apply(console, args);       // eslint-disable-line no-console
  };

  return log;
}();
