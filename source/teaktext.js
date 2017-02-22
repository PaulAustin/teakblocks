/*
Copyright (c) 2016 Paul Austin - SDG

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
var teakText = {};

teakText.blocksToText = function(blockChainIterator) {
  var text = '(\n';
  blockChainIterator(function(chainStart) {
    var block = chainStart;
    text += '  (chain\n';
    while (block !== null) {
      text += '    (' + block.name;
      if (block.prev === null) {
        text += ' x:' + block.rect.left + ' y:' +  block.rect.top;
      }
      if (block.controllerSettings !== null) {
        text += teakText.blockParamsToText(block.controllerSettings.data);
      }
      if (block.targetShadow !== null) {
        // For debugging, this ocassionally happens since
        // compile is asynchronous. TODO fixit.
        text += ' shadow:true';
      }
      text += ')\n';
      block = block.next;
    }
    text += '  )\n';
  });

  text += ')\n';
  return text;
};

teakText.blockParamsToText = function blockParamsToText(params) {
  var text = '';
  for(var propertyName in params) {
    text += ' ' + propertyName + ':' + params[propertyName];
  }
  return text;
};

return teakText;
}();
