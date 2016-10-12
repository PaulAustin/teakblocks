  var tbe = require('./teakblocks.js');
  var tf = require('./teak-forms.js');
  var ko = require('knockout');
  var d, n, d2, n2, rand, pick;

trash = function trash() {
    if (tbe.diagramBlocks.length > 0 ) {

      tbe.diagramBlocks.forEach(function(block) {
        //while(block.rect.left > 0 || block.rect.top > 0){
          var frameCount = 10000000000;

          block.animateState = {
            adx: (19 * (window.innerWidth/20) - block.rect.left)/70,
            ady: 0,//(window.innerHeight - block.rect.top)/frameCount,
            frame: frameCount,
            count: 0
          };

          });
      }
          tbe.audio.playSound(tbe.audio.poof);
          //console.log("This is list:");
          //console.log(tbe.diagramBlocks);
          d = new Date();
          n = d.getTime();
          tbe.diagramBlocks.forEach(function(block){
            dump(block);
          });
          /*tbe.diagramBlocks.forEach(function(block){
            if(block.rect.top){
              block.delete = true;
            }

          });*/



          //

          //block.dmove(0, 5, false, block);
        //}

//https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation



}

dump = function dump(block){
  //console.log(blocks);

  //blocks.forEach(function(block){
    //console.log(block);
    //console.log(block.name + " - " + block.animateState.ady);
    //if(block.rect.top < window.innerHeight){
    //console.log(block);
    //block.animateState.frame = block.animateState.frame/tbe.diagramBlocks.length;
    //console.log(block);
    if(block[0] === undefined){
        frame = block.animateState.frame;
        block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), block);
        block.animateState.count += 1;

    //23087
    //console.log(block.animateState.count);

    //console.log(block);
    if (frame > 1 && block.rect.top < window.innerHeight) {
      block.animateState.frame = frame - 1;

      //console.log(frame);
      requestAnimationFrame(function(timestamp) {

        block.animateState.ady = block.animateState.ady + .3;
        dump(block);
      });
      //console.log('hi');

    } else {
       // Once animation is over shadows are covered, remove them.
       //console.log(block.animateState.ady);
       console.log(block.animateState.ady);
       tbe.clearDiagramBlocks();
       d2 = new Date();
       n2 = d2.getTime();
      console.log(n2 - n);
    }
    }
  //}
  //});
}
