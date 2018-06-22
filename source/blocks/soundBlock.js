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

module.exports = function () {
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;
  var soundBlock = {};

  // List of HTML snippets used for controller tabs.
  soundBlock.tabs= {
    //'pianoKeyboard' : '<i class="fa fa-music" aria-hidden="true"></i>'
  };

  // Initial setting for blocks of this type.
  soundBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{'description':'C4', 'period':'1/4', 's':1 },
      // Indicate what controller is active. This may affect the data format.
      controller:'pianoKeyboard',
    };
  };

  var keyInfo = [
    // Naturals 8
    { name:'C4', f:261.6, s:1}, //0
    { name:'D4', f:293.7, s:3 },
    { name:'E4', f:329.6, s:5 },
    { name:'F4', f:349.2, s:6 },
    { name:'G4', f:392.0, s:8 }, //4
    { name:'A4', f:440.0, s:10 },
    { name:'B4', f:493.9, s:12 },
    { name:'C5', f:523.2, s:13 }, //7
    // Accidentals, its easier to not to interleave them.
    { name:'C#4', f:277.2, keyShift:-3, s:2 },
    { name:'D#4', f:311.1, keyShift:3, s:4  },
    { name:'F#4', f:370.0, keyShift:-4, s:7 },
    { name:'G#4', f:415.3, keyShift:0, s:9  },
    { name:'A#4', f:466.1, keyShift:4, s:11  }
  ];

  soundBlock.configuratorOpen = function(div, block) {
    soundBlock.activeBlock = block;
    div.innerHTML =
        `<div id='pictureEditorDiv' class='editorDiv'>
          <svg id='pianoSvg' width=231px height=145px xmlns='http://www.w3.org/2000/svg'>
            <rect id='pictureRect' y=40px width=231px height=100px rx=4 ry=4 class='block-sound-piano'/>
          </svg>
        </div>`;

    // Create an editor state object for the interactions to work with.
    var svg = document.getElementById('pianoSvg');
    var keyIndex = 0;
    for (var iwKey = 0; iwKey < 8; iwKey++) {
      var wkey = svgb.createRect('piano-key block-sound-piano-w', 4+(iwKey*28), 53, 27, 84, 3);
      wkey.setAttribute('key', keyIndex);
      keyIndex += 1;
      svg.appendChild(wkey);
    }
    for (var ibKey = 0; ibKey < 7; ibKey++) {
      if (ibKey !== 2 && ibKey !== 6) {
        var left = 21+(ibKey*28) + keyInfo[keyIndex].keyShift;
        var bkey = svgb.createRect('piano-key block-sound-piano-b', left, 53, 22, 45, 3);
        bkey.setAttribute('key', keyIndex);
        keyIndex += 1;
        svg.appendChild(bkey);
      }
    }
    var r = svgb.createRect('svg-clear block-sound-piano', 0, 40, 231, 15, 4);
    svg.appendChild(r);

    // Create audio context for generating tones.
    soundBlock.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    interact('.piano-key ', {context:svg})
    .on('down', function (event) {
      soundBlock.lastKey = event.target;
      soundBlock.playKey(event.target);
    })
    .on('move', function (event) {
      if (event.interaction.pointerIsDown) {
        if (soundBlock.currentKey !== event.target && soundBlock.lastKey !== event.target) {
          soundBlock.lastKey = event.target;
          soundBlock.playKey(event.target);
        }
      }
    })
    .on('up', function () {
      soundBlock.stopCurrentKey();
    })
    ;
  };

  // Release the audioContext.
  soundBlock.configuratorClose = function() {
    soundBlock.audioContext.close();
    soundBlock.audioContext = null;
  };

  // State variables for pointer tracking.
  soundBlock.currentKey = null;
  soundBlock.originalClass = null;
  soundBlock.lastKey = null;

  // Play a key, update graphics, etc.
  soundBlock.playKey = function(svgElt) {
    var keyIndex = Number(svgElt.getAttribute('key'));
    svgElt.setAttribute('key', keyIndex);
    soundBlock.stopCurrentKey();
    soundBlock.currentKey = svgElt;
    soundBlock.originalClass = svgElt.getAttribute('class');
    var newClass = soundBlock.originalClass + '-pressed';
    svgElt.setAttribute('class', newClass);

    // Start oscillator
    var ctx = soundBlock.audioContext;
    var oscillator = ctx.createOscillator();
    var gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.3;
    oscillator.type = 'sine';
    oscillator.frequency.value = keyInfo[keyIndex].f;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
    gain.gain.setTargetAtTime(0, ctx.currentTime + 0.3, 0.015);

    // Make sure note ends.
    soundBlock.keyTimer = setTimeout(function() {
      soundBlock.stopCurrentKey();
    }, 400);

    // Update block
    soundBlock.activeBlock.controllerSettings.data.description = keyInfo[keyIndex].name;
    soundBlock.activeBlock.controllerSettings.data.s = keyInfo[keyIndex].s;
    soundBlock.activeBlock.updateSvg();
  };

  soundBlock.stopCurrentKey = function() {
    if (soundBlock.currentKey !== null) {
      clearTimeout(soundBlock.keyTimer);
      soundBlock.keyTimer = undefined;
      soundBlock.currentKey.setAttribute('class', soundBlock.originalClass);
      soundBlock.currentKey = null;
    }
    // Stop oscillator
  };
  // Sound block to make a joyful noise.
  soundBlock.svg = function(root, block) {
    // Speaker
    var pathd = '';
    pathd =  pb.move(20, 25);
    pathd += pb.hline(9);
    pathd += pb.line(10, -10);
    pathd += pb.vline(30);
    pathd += pb.line(-10, -10);
    pathd += pb.hline(-9);
    pathd += pb.vline(-10);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    // Sound wave arcs
    pathd = '';
    pathd =  pb.move(45, 25);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);

    // Description such as note name.
    var name = block.controllerSettings.data.description;
    var text = svgb.createText('block-identity-text svg-clear', 40, 70, name);
    text.setAttribute('text-anchor', 'middle');
    root.appendChild(text);

    return root;
  };

  return soundBlock;
}();
