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

module.exports = function () {
  var teakForm = {};

  // Only one form should be showing, and none to start with.
  teakForm.openForm = null;

  // Toggle the position of a form. Since they are actually all
  // stacked but with different transform locations, it is necessary
  // to toggle pointerEvents, otherwise the top one eats them all.
  teakForm.showHide = function showHide(component) {
    var tform = document.getElementById(component.domId);
    // See what the current state is.
    var opened = tform.getAttribute('opened');
    if (opened === 'false') {
      this.hideOpenForm();
      opened = 'true';
      tform.style.pointerEvents = 'all';
      tform.classList.remove('closed');
      tform.classList.add('opened');
      teakForm.openForm = component;
    } else {
      opened = 'false';
      tform.style.pointerEvents = 'none';
      tform.classList.remove('opened');
      tform.classList.add('closed');
      teakForm.openForm = null;
    }
    if (tform.showHide !== undefined) {
      tform.showHide(opened === 'true');
    }
    if (typeof component.onShowHide === 'function') {
      component.onShowHide(opened === 'true');
    }
    tform.setAttribute('opened', opened);
  };

  teakForm.hideOpenForm = function hideOpenForm() {
    if (teakForm.openForm !== null) {
      teakForm.showHide(teakForm.openForm);
    }
  };

  return teakForm;
}();
