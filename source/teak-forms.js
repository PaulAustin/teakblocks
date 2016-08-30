module.exports = function () {
tf = {};
tf.css = `
.container {
    position: fixed;
    top: 1em;
    right: 1em;
    width: 10em;
    background-color: #DCE775;
    border-radius: 10px;
    box-shadow: 4px 4px 5px #eaeaea;
    font-family:"helvetica";
    color:#33691E;
    font-size:30px;
    padding:30px;
    -webkit-user-select: none;
}
label {
  margin: 15
  cursor: pointer;
  color: #666;
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
  animation: tick1 150ms ease-in;
}
label input[type="checkbox"]:checked + .label-text:before {
  content: "\uf046";
  color: #06a3e9;
  animation: tick2 150ms ease-in;
}
label input[type="checkbox"]:disabled + .label-text {
  color: #aaa;
}
label input[type="checkbox"]:disabled + .label-text:before {
  content: "";
  color: #ccc;
}
@keyframes tick1 {
  0% {transform: scale(1);}
  50% {transform: scale(1.3);}
  100% {transform: scale(1);}
}
@keyframes tick2 {
  0% {transform: scale(1);}
  50% {transform: scale(1.3);}
  100% {transform: scale(1);}
}
`;
return tf;
}();
