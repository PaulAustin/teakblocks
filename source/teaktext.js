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
var teak = require('teak');

//------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------
teakText.textToBlocks = function(tbe, text) {
  console.log('new loader');
  var state = {};
  // Visitor pattern may be better, a lot better.
  var teakJSO = teak.parse(text, state, function(name) { return name; });
  teakText.loadJsoTeak(tbe, teakJSO);
};

teakText.loadJsoTeak = function(tbe, jsoTeak) {
  console.log(' loadJSO', jsoTeak);
  if (Array.isArray(jsoTeak)) {
    let i = 0;
    for (i = 0; i < jsoTeak.length; i++) {
      var jsoChain = jsoTeak[i];
      if (jsoChain._0 !== 'chain') {
        console.log(' unrecognized chain section');
        return;
      } else {
        var x = jsoChain.x;
        var y = jsoChain.y;
        let jsoChainBlocks = jsoChain._3;
        console.log(' TJDO', jsoChain, x, y);
        var chain = teakText.loadJsoTeakBlocks(tbe, jsoChainBlocks, x, y, null);

        // Refresh the graphics in each block in the chain.
        var block = chain;
        while (block !== null) {
          block.updateSvg();
          block = block.next;
        }
        chain.fixupChainCrossBlockSvg();
      }
    }
  } else {
    console.log(' unrecognized teak file');
    return;
  }
};

teakText.loadJsoTeakBlocks = function(tbe, jsoBlocks, x, y, prev) {
  let i = 1;
  let firstBlock = null;
  for (i = 0; i < jsoBlocks.length; i++) {
    const blockName = jsoBlocks[i]._0;
    const block = tbe.addBlock(x, y, blockName);
    // console.log('adding block', x, y, blockName, prev);
    if (firstBlock === null) {
      firstBlock = block;
    }
    if (prev !== null) {
      prev.next = block;
      block.prev = prev;
    }
    // Load block specific settings, including sub blocks.
    if (blockName === 'loop') {
      prev = this.loadLoop(tbe, block, jsoBlocks[i]);
    } else {
      this.loadBlockDetails(block, jsoBlocks[i]);
      prev = block;
    }
    x = prev.blockRight;
  }
  return firstBlock;
};

// Load a loop, TODO needs to be less hardcoded.
teakText.loadLoop = function (tbe, block, jsoBlock) {
  // Load the sub chunk of blocks
  const jsoChainBlocks = jsoBlock._2;
  var x = block.blockRight;
  const y = block.blockTop;
  var subChunk = teakText.loadJsoTeakBlocks(tbe, jsoChainBlocks, x, y, block);
  var preTail = null;
  if (subChunk !== null) {
    var subChunkEnd = subChunk.last;
    preTail = subChunkEnd;
  } else {
    preTail = block;
  }
  // The tail is not serialized, so if must be created and stiched into the list.
  x = preTail.blockRight;
  var tail = tbe.addBlock(x, y, 'tail');
  preTail.next = tail;
  tail.prev = preTail;
  block.flowTail = tail;
  tail.flowHead = block;
  return tail;
};

teakText.loadBlockDetails = function (block, jsoBlock) {
  for (var key in jsoBlock) {
    if (jsoBlock.hasOwnProperty(key)) {
      if (key !== '_0') {
        block.controllerSettings.data[key] = jsoBlock[key];
      }
    }
  }
};

return teakText;
}();
