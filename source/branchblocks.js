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

/*
A branch block is a set of multipl paths. Two grabable parts exist.
the root block and the end point. They can be moved independently.
but there is only one view block. the branch points to the block it jumps to
           _____________
          /             |
    [ b1 ][ b2 ][ b3 ][ b4 ]
          @

In addition to the prev and next the branch will have a branch values
that points to b2.

When the part is rendered to an svg view it look for the coordinates ot the
branch object to generate the path.

the branch has to point some where so it initialy point to the block it self
 some trickyness here. it might vary if its the first block in the chain
 a default forward branch should be assumed. dropping block is more subtle
 in this case.

*/

var svgns = 'http://www.w3.org/2000/svg';

var pathBuilder = {
  move: function (dx, dy) {
    return 'm' + dx + ' ' + dy + ' ';
  },
  hline: function(length) {
    return 'h' + length + ' ';
  },
  vline: function(length) {
    return 'v' + length + ' ';
  },
  arc: function(radius, degrees, large, sweep, dx, dy) {
    var text = 'a' + radius + ' ' + radius + ' ' + degrees;
    text += ' ' + large + ' ' + sweep + ' ' + dx + ' ' + dy + ' ';
    return text;
  },
  close: function() {
    return 'z ';
  }
};

function createBranchPath1(block, branchBlock) {

  var bw = 80;   // block width
  var pw = 16;    // path width

  var pb = pathBuilder;
  var pathd = '';
  pathd = pb.move((bw/2)-(pw/2), 4);
  pathd += pb.arc(pw/2, 180, 1, 0, 16, 0);
  pathd += pb.vline(-24);
  pathd += pb.arc(pw, 90, 0, 0, -pw, -pw);
  pathd += pb.hline(-102);
  pathd += pb.arc(pw, 90, 0, 0, -pw, pw);
  pathd += pb.vline(104);
  pathd += pb.arc(-pw/2, 180, 0, 0, pw, 0);
  pathd += pb.vline(-96);
  pathd += pb.arc(-pw/2, 90, 0, 1, pw/2, -pw/2);
  pathd += pb.hline(86);
  pathd += pb.arc(-pw/2, 90, 0, 1, pw/2, pw/2);
  pathd += pb.close();

  var path = document.createElementNS(svgns, 'path');
  path.setAttribute('class', 'branch-path');
  path.setAttribute('d', pathd);

  return path;
}

function createBranchPath(block, branchBlock) {

  var bw = 80;   // block width
  var pw = 10;    // path width

  var pb = pathBuilder;
  var pathd = '';
  pathd = pb.move((bw/2)-(pw/2), 0);
  pathd += pb.arc(pw, 360, 1, 0, 16, 0);
  pathd += pb.vline(-24);
  pathd += pb.arc(pw, 90, 0, 0, -pw, -pw);
  pathd += pb.hline(-102);
  pathd += pb.arc(pw, 90, 0, 0, -pw, pw);
  pathd += pb.vline(104);
  pathd += pb.arc(-pw/2, 180, 0, 0, pw, 0);
  pathd += pb.vline(-96);
  pathd += pb.arc(-pw/2, 90, 0, 1, pw/2, -pw/2);
  pathd += pb.hline(92);
  pathd += pb.arc(-pw/2, 90, 0, 1, pw/2, pw/2);
  pathd += pb.close();

  var path = document.createElementNS(svgns, 'path');
  path.setAttribute('class', 'branch-path');
  path.setAttribute('d', pathd);

  return path;
}
