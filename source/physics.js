
module.exports = function (){

  var a = false;
function trashBlocks(editor) {
    if (editor.diagramBlocks.length > 0 ) {

      editor.diagramBlocks.forEach(function(block) {
          var frameCount = 80;
          var xPos = block.rect.left - (window.innerWidth/2);
          var yPos = block.rect.top - (window.innerHeight/2);
          //need to find the hyp then divide the xPos and yPos by it
          var hyp = Math.sqrt((xPos * xPos) + (yPos * yPos));
          var getX = (xPos/hyp) * 10;
          var getY = (yPos/hyp) * 10;
          block.animateState = {
            adx: getX,
            ady: getY,
            frame: frameCount,
            count: 0
          };

          });
      }
          editor.audio.playSound(editor.audio.poof);

          editor.diagramBlocks.forEach(function(block){
            dump(block, editor);
          });

}

  function dump(block, editor) {
    if(block[0] === undefined){
        var frame = block.animateState.frame;
        block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), block);
        block.animateState.count += 1;

    if (frame > 1 ){
      block.animateState.frame = frame - 1;

      requestAnimationFrame(function(timestamp) {
        dump(block, editor);
      });

    } else {

        editor.clearDiagramBlocks();
        console.log("done");
    }
  }
}

return trashBlocks;
}();
