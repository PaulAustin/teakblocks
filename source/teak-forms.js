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
      -webkit-user-select: none;
  }
  label {
    margin: 15
    cursor: pointer;
  }
  label input[type="checkbox"] {
  /*  display: none; */
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
    0% {transform: scale(1);}
    60% {transform: scale(0.8);}
    100% {transform: scale(1);}
  }
  @keyframes toChecked {
    0% {transform: scale(1);}
    60% {transform: scale(1.2);}
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

  teakForm.showHide = function showHide(formId) {
    var tform = document.getElementById(formId);
    var opened = tform.getAttribute('opened');
    if (opened === 'false') {
      opened = 'true';
    } else {
      opened = 'false';
    }
    tform.setAttribute('opened', opened);
  };

  return teakForm;
}();
