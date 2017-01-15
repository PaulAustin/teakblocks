
module.exports = function (){

  function dump(block, editor) {
    if(block[0] === undefined) {
          var frame = block.animateState.frame;
          block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), block);
          block.animateState.count += 1;

      if (frame > 1 ) {
        block.animateState.frame = frame - 1;

        requestAnimationFrame(function() {
          dump(block, editor);
        });
      } else {
          editor.clearDiagramBlocks();
      }
    }
  }

function trashBlocks(editor) {

    // Determine center of block chain, then have all blocks scatter
    // from that point. (righ now it does it from the center of the screen)
    //if (true || editor.diagramBlocks.length > 0 ) {
        editor.forEachDiagramBlock(function(block) {
        var frameCount = 100;
        var xPos = block.rect.left - (window.innerWidth/2);
        var yPos = block.rect.top - (window.innerHeight/2);
        //need to find the hyp then divide the xPos and yPos by it
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
    editor.audio.playSound(editor.audio.poof);
    editor.forEachDiagramBlock(function(block) {
      dump(block, editor);
    });
  //}
}

return trashBlocks;
}();
