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
  teakForm.styleTag = `
  <style>
  .container {
      width:12em;
      background-color: #75DCE7;
      border-radius: 10px;
      box-shadow: 1px 4px 5px 2px rgba(0, 0, 0, 0.2);
      font-family:"helvetica";
      color:#33691E;
      font-size:30px;
      padding:30px;
      touch-action: none; /* prevents any screen bounce on android */
  }
  label {
    margin: 15
    cursor: pointer;
    /* prevent selecting text in control captions */
    -webkit-user-select: none;
    user-select: none;
  }
  label input[type="checkbox"] {
    display: none;
  }
  label input[type="checkbox"] + .label-text:before {
    content: "\uf096";
    font-family: "FontAwesome";
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    width: 1em;
    display: inline-block;
    margin-right: 5px;
    animation: toUnchecked 200ms ease-in;
  }
  label input[type="checkbox"]:checked + .label-text:before {
    content: "\uf046";
    color: #06a3e9;
    animation: toChecked 200ms ease-in;
  }
  label input[type="checkbox"]:disabled + .label-text {
    color: #aaa;
  }
  label input[type="checkbox"]:disabled + .label-text:before {
    content: "f096";  /* square-o */
    color: #ccc;
  }
  @keyframes toUnchecked {
    0% {transform: scale(0.9);}
    60% {transform: scale(1.1);}
    100% {transform: scale(1);}
  }
  @keyframes toChecked {
    0% {transform: scale(0.9);}
    60% {transform: scale(1.1);}
    100% {transform: scale(1);}
  }
  .teakform {
      transition: transform .4s ease;
  }
  .teakform.opened {
      transform: translate(0, 0%);
  }
  .teakform.closed {
      transform: translate(0, -120%);
  }
  .teakform.closed-down {
      transform: translate(0, 120%);
  }
  .teakform {
      box-sizing:border-box;
  }
  </style>
  `;

  // Only one form should be showing, and none to start with.
  teakForm.openForm = null;

  // Update a DOM elements class list based on the open attribute.
  teakForm.setOpenAttribute = function setOpenAttribute(form, value) {
      if (value === 'true') {
        form.classList.remove('closed');
        form.classList.add('opened');
      } else if (value === 'false') {
        form.classList.remove('opened');
        form.classList.add('closed');
      }
  };

  // Toggle the position of a form. Since they are actually all
  // stacked but wiht different transform locations, it is necessary
  // to toggle pointerEvents, other wise the top one eats them all.
  teakForm.showHide = function showHide(formId) {
    var tform = document.getElementById(formId);
    var opened = tform.getAttribute('opened');
    if (opened === 'false') {
      this.hideOpenForm();
      opened = 'true';
      tform.style.pointerEvents = 'all';
      teakForm.openForm = formId;
    } else {
      opened = 'false';
      tform.style.pointerEvents = 'none';
      teakForm.openForm = null;
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
