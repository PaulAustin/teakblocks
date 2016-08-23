
tbe = require('./teakblocks.js');

tbe.init(
  document.getElementById('editorCanvas'),
  document.getElementById('teakCode'));

tbe.addPaletteBlock(400,  20, 'motor', {port:'a','power':50,'time':'2.5s'});
tbe.addPaletteBlock(100, 120, 'wait',  {time:'2.5s'});
tbe.addPaletteBlock(100, 220, 'light', {color:'blue'});
tbe.addPaletteBlock(100, 320, 'sound', {note:'C5'});
tbe.addPaletteBlock(100, 420, 'start', {when:'dio1-rising'});
tbe.addPaletteBlock(100, 420, 'quark', {flavor:'charmed'});
