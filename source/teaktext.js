/*
Copyright (c) 2017 Paul Austin - SDG

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
  var indentText = '  ';
  blockChainIterator(function(block) {
    text += indentText + '(chain';
    text += ' x:' + block.rect.left + ' y:' +  block.rect.top + ' (\n';
    text += teakText.chunkToText(block, null, indentText + '  ');
    text += indentText + '))\n';
  });

  text += ')\n';
  return text;
};

teakText.chunkToText = function(chunkStart, chunkEnd, indentText) {
  var block = chunkStart;
  var text = '';
  while (block !== chunkEnd) {
    text += indentText + '(' + block.name;
    if (block.controllerSettings !== null) {
      text += ' ' + teakText.blockParamsToText(block.controllerSettings.data);
    }
    if (block.flowTail !== null) {
      // If it is nesting, then recurse with a bit of indentation.
      text += ' (\n';
      text += teakText.chunkToText(block.next, block.flowTail, indentText + '  ');
      block = block.flowTail;
      text += indentText + ')';
    }
    text += ')\n';
    block = block.next;
  }
  return text;
};

teakText.blockParamsToText = function blockParamsToText(params) {
  var text = '';
  var spaceSeparator = '';
  for(var propertyName in params) {
    var value = params[propertyName];
    text += spaceSeparator + propertyName + ':' + this.valueToText(value);
    spaceSeparator = ' ';
  }
  return text;
};

teakText.valueToText = function(value) {
  var text = '';
  if (value.constructor === Array) {
    var spaceSeparator = '';
    var index = 0;
    text = '(';
    for (index = 0; index < value.length; index += 1) {
      text += spaceSeparator + this.valueToText(value[index]);
      spaceSeparator = ' ';
    }
    text += ')';
  } else if (typeof value === 'string') {
    text = "'" + String(value) + "'";
  } else {
    text = String(value);
  }
  return text;
};

return teakText;
}();
