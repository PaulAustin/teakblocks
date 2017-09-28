/*
Copyright (c) 2017 Sidharth Srinivasan

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

  // Move block across the screen on frame at a time.
  function trashAnimate(block, editor) {
    if(block[0] === undefined) {
      var frame = block.animateState.frame;
      block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), block);
      block.animateState.count += 1;

      if (editor.blocksOnScreen() && frame > 0) {
        // Queue up next animation frame.
        block.animateState.frame = frame - 1;
        requestAnimationFrame(function() {
          trashAnimate(block, editor);
        });
      } else {
        // Animation is over, now delete the blocks..
        editor.clearDiagramBlocks();
      }
    }
  }

// Determine center of block chain, then have all blocks scatter.
function trashBlocks(editor) {

  // Calculate initial trajectory for blocks.
  editor.forEachDiagramBlock(function(block) {
      var frameCount = 100;
      var xPos = block.left - (window.innerWidth/2);
      var yPos = block.top - (window.innerHeight/2);
      // Need to find the hypotenuse then divide the xPos and yPos by it.
      var hyp = Math.sqrt((xPos * xPos) + (yPos * yPos));
      var getX = (xPos/hyp) * 8;
      var getY = (yPos/hyp) * 8;
      block.animateState = {
        adx: getX,
        ady: getY,
        frame: frameCount,
        count: 0
      };
    });

    // Play a sound and begin the animation.
    editor.audio.playSound(editor.audio.poof);
    editor.forEachDiagramBlock(function(block) {
      trashAnimate(block, editor);
    });
}

return trashBlocks;
}();
