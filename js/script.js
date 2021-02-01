"option strict";

let width;
let height;

window.onload = init;

function init() {
  width = window.innerWidth;
  height = window.innerHeight;

  //window.addEventListener("resize", onResize, false);
  //onResize();
}

/*
function onResize() {
  //console.log("Resizing");
  width = window.innerWidth;
  height = window.innerHeight;

  let topHeight = 0.15 * height;
  let botHeight = 0.85 * height;

  document.getElementById("bottomPanel").style.height = calc(100vh - 50px);

  //document.getElementById("bottomPanel").style.height = calc(100 % -topHeight);
  //console.log("BotHeight is " + height + ", " + botHeight);
  //document.getElementById("topPanel").style.height = topHeight;
  //document.getElementById("bottomPanel").style.height = botHeight;
} */
