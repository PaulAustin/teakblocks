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

require('webcomponents.js');

// TODO make the teak block editor a web component as well.
var tbe = require('./teakblocks.js');

var webComponents = {};

webComponents.config = require('./teak-config-widget.js');
webComponents.sound = require('./teak-sound-widget.js');
//webComponents.motor = require('./teak-motor-widget.js');
//webComponents.LED5x5 = require('./teak-led5x5-widget.js');

tbe.init(
  document.getElementById('editorCanvas'),
  document.getElementById('teakCode'));

var button = document.getElementById('config-button');
button.onclick = tbe.showHideConfig;

button = document.getElementById('clear-button');
button.onclick = tbe.clearDiagramBlocks;

var palettes =  {
  tabs:['A', 'B', 'C'],
  A:['A1', 'A2', 'A3', 'A4', 'A5'],
  B:['B1', 'B2', 'B3', 'B4', 'B5'],
  C:['C1', 'C2', 'C3', 'C4', 'C5'],
};

tbe.initPalettes(palettes);

/*
re work into Sidharth's code.
tbe.addPaletteBlock(400,  20, 'motor', {port:'a','power':50,'time':'2.5s'});
tbe.addPaletteBlock(100, 120, 'wait',  {time:'2.5s'});
tbe.addPaletteBlock(100, 220, 'light', {color:'blue'});
tbe.addPaletteBlock(100, 320, 'sound', {note:'C5'});
tbe.addPaletteBlock(100, 420, 'start', {when:'dio1-rising'});
tbe.addPaletteBlock(100, 420, 'quark', {flavor:'charmed'});
*/
