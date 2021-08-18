// HTML Program to draw and manipulate a Coons Bicubic Surface
// Written by Amarnath S, amarnaths.codeproject@gmail.com, July 2019
// Revised August 2021. Fixed an issue with computation of normals.
//  Now, Three.js does the normal computations.

/* Requirements:
   1. Should enable the user to modify the x, y, z coordinates of the four points
       corresponding to the u, w values of (0, 0), (0, 1), (1, 0) and (1, 1).
       The range for these coordinates should be [-1,1].
   2. Should enable the user to modify the x, y, z components of the tangent 
       vector with respect to u, at the four points corresponding to the 
       u, w values of (0, 0), (0, 1), (1, 0) and (1, 1). 
       Not necessarily the normalized tangents. The range for these tangent vector 
       components should be [-10, 10].
   3. Should enable the user to modify the x, y, z components of the tangent 
       vector with respect to w, at the four points corresponding to the 
       u, w values of (0, 0), (0, 1), (1, 0) and (1, 1). 
       Not necessarily the normalized tangents. The range for these tangent vector 
       components should be [-10, 10].
   4. Should enable the user to modify the x, y, z components of the twist 
       vector with respect to u and w, at the four points corresponding to the 
       u, w values of (0, 0), (0, 1), (1, 0) and (1, 1). 
       Not necessarily the normalized twist vectors. The range for these twist vector 
       components should be [-10, 10].
   5. Should display the Coons Bicubic Patch on the screen, and this surface should 
      change dynamically as the user modifies any of the values using sliders. 
      Perspective View.
   6. Should display the bounding box of dimension 2 units, centred at the origin.
   7. Should enable the user to modify the camera angle, from which viewing is done.
   8. Should enable the user to modify the u, w values, and should display a moving point
      on the surface as the user modifies these values using the sliders.
   9. All user input should be via sliders.
   10. Should use WebGL, in the form of three.js. 

    Tested on Chrome, Firefox and Edge, on Windows.
 */

"use strict";

let p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, p4x, p4y, p4z;
let p1ux, p1uy, p1uz, p2ux, p2uy, p2uz, p3ux, p3uy, p3uz, p4ux, p4uy, p4uz;
let p1wx, p1wy, p1wz, p2wx, p2wy, p2wz, p3wx, p3wy, p3wz, p4wx, p4wy, p4wz;
let p1uwx,
  p1uwy,
  p1uwz,
  p2uwx,
  p2uwy,
  p2uwz,
  p3uwx,
  p3uwy,
  p3uwz,
  p4uwx,
  p4uwy,
  p4uwz;
let scene, camera, renderer;
let halfCubeSide;
let p1xRange, p2xRange, p3xRange, p4xRange;
let p1yRange, p2yRange, p3yRange, p4yRange;
let p1zRange, p2zRange, p3zRange, p4zRange;
let p1uxRange, p2uxRange, p3uxRange, p4uxRange;
let p1uyRange, p2uyRange, p3uyRange, p4uyRange;
let p1uzRange, p2uzRange, p3uzRange, p4uzRange;
let p1wxRange, p2wxRange, p3wxRange, p4wxRange;
let p1wyRange, p2wyRange, p3wyRange, p4wyRange;
let p1wzRange, p2wzRange, p3wzRange, p4wzRange;
let p1uwxRange, p2uwxRange, p3uwxRange, p4uwxRange;
let p1uwyRange, p2uwyRange, p3uwyRange, p4uwyRange;
let p1uwzRange, p2uwzRange, p3uwzRange, p4uwzRange;
let cameraAngleRange, uRange, wRange, uValue, wValue;
let cameraAngle, camRadius;
let point1, point2, point3, point4, pointUW;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();
let points = [];
let spheres = [];
let surfacePoints = [];
let noDivisions = 30;
let step, width;
let surfaceMesh, lineWire;
let wireCheck;
let uVal, wVal;

window.onload = init;

function init() {
  initializeValues();

  scene = new THREE.Scene();
  let width = (7 * window.innerWidth) / 10;
  camera = new THREE.PerspectiveCamera(
    45,
    width / window.innerHeight,
    0.1,
    1000
  );
  camera.updateProjectionMatrix();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.antialias = true;

  window.addEventListener("resize", onResize, false);
  wireCheck = document.getElementById("wireframe");
  wireCheck.addEventListener("click", handleWireframe, false);

  cameraAngle = 25;
  camRadius = 5;

  // Tab 1 - Four Corner Points - start
  // Point P1 X
  p1xRange = document.getElementById("point1x");
  p1xRange.addEventListener(
    "input",
    function () {
      p1x = parseFloat(p1xRange.value);
      document.getElementById("opPoint1x").textContent = p1x.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 X
  p2xRange = document.getElementById("point2x");
  p2xRange.addEventListener(
    "input",
    function () {
      p2x = parseFloat(p2xRange.value);
      document.getElementById("opPoint2x").textContent = p2x.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 X
  p3xRange = document.getElementById("point3x");
  p3xRange.addEventListener(
    "input",
    function () {
      p3x = parseFloat(p3xRange.value);
      document.getElementById("opPoint3x").textContent = p3x.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 X
  p4xRange = document.getElementById("point4x");
  p4xRange.addEventListener(
    "input",
    function () {
      p4x = parseFloat(p4xRange.value);
      document.getElementById("opPoint4x").textContent = p4x.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 Y
  p1yRange = document.getElementById("point1y");
  p1yRange.addEventListener(
    "input",
    function () {
      p1y = parseFloat(p1yRange.value);
      document.getElementById("opPoint1y").textContent = p1y.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 Y
  p2yRange = document.getElementById("point2y");
  p2yRange.addEventListener(
    "input",
    function () {
      p2y = parseFloat(p2yRange.value);
      document.getElementById("opPoint2y").textContent = p2y.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 Y
  p3yRange = document.getElementById("point3y");
  p3yRange.addEventListener(
    "input",
    function () {
      p3y = parseFloat(p3yRange.value);
      document.getElementById("opPoint3y").textContent = p3y.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 Y
  p4yRange = document.getElementById("point4y");
  p4yRange.addEventListener(
    "input",
    function () {
      p4y = parseFloat(p4yRange.value);
      document.getElementById("opPoint4y").textContent = p4y.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 Z
  p1zRange = document.getElementById("point1z");
  p1zRange.addEventListener(
    "input",
    function () {
      p1z = parseFloat(p1zRange.value);
      document.getElementById("opPoint1z").textContent = p1z.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 Z
  p2zRange = document.getElementById("point2z");
  p2zRange.addEventListener(
    "input",
    function () {
      p2z = parseFloat(p2zRange.value);
      document.getElementById("opPoint2z").textContent = p2z.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 Z
  p3zRange = document.getElementById("point3z");
  p3zRange.addEventListener(
    "input",
    function () {
      p3z = parseFloat(p3zRange.value);
      document.getElementById("opPoint3z").textContent = p3z.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 Z
  p4zRange = document.getElementById("point4z");
  p4zRange.addEventListener(
    "input",
    function () {
      p4z = parseFloat(p4zRange.value);
      document.getElementById("opPoint4z").textContent = p4z.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );
  // Tab 1 - Four Corner Points - End

  // Tab 2 - Four U Tangents - Start
  // Point P1 U Tangent X
  p1uxRange = document.getElementById("point1ux");
  p1uxRange.addEventListener(
    "input",
    function () {
      p1ux = parseFloat(p1uxRange.value);
      document.getElementById("opPoint1ux").textContent = p1ux.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 U Tangent X
  p2uxRange = document.getElementById("point2ux");
  p2uxRange.addEventListener(
    "input",
    function () {
      p2ux = parseFloat(p2uxRange.value);
      document.getElementById("opPoint2ux").textContent = p2ux.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 U Tangent X
  p3uxRange = document.getElementById("point3ux");
  p3uxRange.addEventListener(
    "input",
    function () {
      p3ux = parseFloat(p3uxRange.value);
      document.getElementById("opPoint3ux").textContent = p3ux.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 U Tangent X
  p4uxRange = document.getElementById("point4ux");
  p4uxRange.addEventListener(
    "input",
    function () {
      p4ux = parseFloat(p4uxRange.value);
      document.getElementById("opPoint4ux").textContent = p4ux.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 U Tangent Y
  p1uyRange = document.getElementById("point1uy");
  p1uyRange.addEventListener(
    "input",
    function () {
      p1uy = parseFloat(p1uyRange.value);
      document.getElementById("opPoint1uy").textContent = p1uy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 U Tangent Y
  p2uyRange = document.getElementById("point2uy");
  p2uyRange.addEventListener(
    "input",
    function () {
      p2uy = parseFloat(p2uyRange.value);
      document.getElementById("opPoint2uy").textContent = p2uy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 U Tangent Y
  p3uyRange = document.getElementById("point3uy");
  p3uyRange.addEventListener(
    "input",
    function () {
      p3uy = parseFloat(p3uyRange.value);
      document.getElementById("opPoint3uy").textContent = p3uy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 U Tangent Y
  p4uyRange = document.getElementById("point4uy");
  p4uyRange.addEventListener(
    "input",
    function () {
      p4uy = parseFloat(p4uyRange.value);
      document.getElementById("opPoint4uy").textContent = p4uy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 U Tangent Z
  p1uzRange = document.getElementById("point1uz");
  p1uzRange.addEventListener(
    "input",
    function () {
      p1uz = parseFloat(p1uzRange.value);
      document.getElementById("opPoint1uz").textContent = p1uz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 U Tangent Z
  p2uzRange = document.getElementById("point2uz");
  p2uzRange.addEventListener(
    "input",
    function () {
      p2uz = parseFloat(p2uzRange.value);
      document.getElementById("opPoint2uz").textContent = p2uz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 U Tangent Z
  p3uzRange = document.getElementById("point3uz");
  p3uzRange.addEventListener(
    "input",
    function () {
      p3uz = parseFloat(p3uzRange.value);
      document.getElementById("opPoint3uz").textContent = p3uz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 U Tangent Z
  p4uzRange = document.getElementById("point4uz");
  p4uzRange.addEventListener(
    "input",
    function () {
      p4uz = parseFloat(p4uzRange.value);
      document.getElementById("opPoint4uz").textContent = p4uz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );
  // Tab 2 - Four U Tangents - End

  // Tab 3 - Four W Tangents - Start
  // Point P1 W Tangent X
  p1wxRange = document.getElementById("point1wx");
  p1wxRange.addEventListener(
    "input",
    function () {
      p1wx = parseFloat(p1wxRange.value);
      document.getElementById("opPoint1wx").textContent = p1wx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 W Tangent X
  p2wxRange = document.getElementById("point2wx");
  p2wxRange.addEventListener(
    "input",
    function () {
      p2wx = parseFloat(p2wxRange.value);
      document.getElementById("opPoint2wx").textContent = p2wx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 W Tangent X
  p3wxRange = document.getElementById("point3wx");
  p3wxRange.addEventListener(
    "input",
    function () {
      p3wx = parseFloat(p3wxRange.value);
      document.getElementById("opPoint3wx").textContent = p3wx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 W Tangent X
  p4wxRange = document.getElementById("point4wx");
  p4wxRange.addEventListener(
    "input",
    function () {
      p4wx = parseFloat(p4wxRange.value);
      document.getElementById("opPoint4wx").textContent = p4wx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 W Tangent Y
  p1wyRange = document.getElementById("point1wy");
  p1wyRange.addEventListener(
    "input",
    function () {
      p1wy = parseFloat(p1wyRange.value);
      document.getElementById("opPoint1wy").textContent = p1wy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 W Tangent Y
  p2wyRange = document.getElementById("point2wy");
  p2wyRange.addEventListener(
    "input",
    function () {
      p2wy = parseFloat(p2wyRange.value);
      document.getElementById("opPoint2wy").textContent = p2wy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 W Tangent Y
  p3wyRange = document.getElementById("point3wy");
  p3wyRange.addEventListener(
    "input",
    function () {
      p3wy = parseFloat(p3wyRange.value);
      document.getElementById("opPoint3wy").textContent = p3wy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 W Tangent Y
  p4wyRange = document.getElementById("point4wy");
  p4wyRange.addEventListener(
    "input",
    function () {
      p4wy = parseFloat(p4wyRange.value);
      document.getElementById("opPoint4wy").textContent = p4wy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 W Tangent Z
  p1wzRange = document.getElementById("point1wz");
  p1wzRange.addEventListener(
    "input",
    function () {
      p1wz = parseFloat(p1wzRange.value);
      document.getElementById("opPoint1wz").textContent = p1wz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 W Tangent Z
  p2wzRange = document.getElementById("point2wz");
  p2wzRange.addEventListener(
    "input",
    function () {
      p2wz = parseFloat(p2wzRange.value);
      document.getElementById("opPoint2wz").textContent = p2wz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 W Tangent Z
  p3wzRange = document.getElementById("point3wz");
  p3wzRange.addEventListener(
    "input",
    function () {
      p3wz = parseFloat(p3wzRange.value);
      document.getElementById("opPoint3wz").textContent = p3wz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 W Tangent Z
  p4wzRange = document.getElementById("point4wz");
  p4wzRange.addEventListener(
    "input",
    function () {
      p4wz = parseFloat(p4wzRange.value);
      document.getElementById("opPoint4wz").textContent = p4wz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );
  // Tab 3 - Four W Tangents - End

  // Tab 4 - Four UW Twists - Start
  // Point P1 UW Twist X
  p1uwxRange = document.getElementById("point1uwx");
  p1uwxRange.addEventListener(
    "input",
    function () {
      p1uwx = parseFloat(p1uwxRange.value);
      document.getElementById("opPoint1uwx").textContent = p1uwx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 UW Twist X
  p2uwxRange = document.getElementById("point2uwx");
  p2uwxRange.addEventListener(
    "input",
    function () {
      p2uwx = parseFloat(p2uwxRange.value);
      document.getElementById("opPoint2uwx").textContent = p2uwx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 UW Twist X
  p3uwxRange = document.getElementById("point3uwx");
  p3uwxRange.addEventListener(
    "input",
    function () {
      p3uwx = parseFloat(p3uwxRange.value);
      document.getElementById("opPoint3uwx").textContent = p3uwx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 UW Twist X
  p4uwxRange = document.getElementById("point4uwx");
  p4uwxRange.addEventListener(
    "input",
    function () {
      p4uwx = parseFloat(p4uwxRange.value);
      document.getElementById("opPoint4uwx").textContent = p4uwx.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 UW Twist Y
  p1uwyRange = document.getElementById("point1uwy");
  p1uwyRange.addEventListener(
    "input",
    function () {
      p1uwy = parseFloat(p1uwyRange.value);
      document.getElementById("opPoint1uwy").textContent = p1uwy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 UW Twist Y
  p2uwyRange = document.getElementById("point2uwy");
  p2uwyRange.addEventListener(
    "input",
    function () {
      p2uwy = parseFloat(p2uwyRange.value);
      document.getElementById("opPoint2uwy").textContent = p2uwy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 UW Twist Y
  p3uwyRange = document.getElementById("point3uwy");
  p3uwyRange.addEventListener(
    "input",
    function () {
      p3uwy = parseFloat(p3uwyRange.value);
      document.getElementById("opPoint3uwy").textContent = p3uwy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 UW Twist Y
  p4uwyRange = document.getElementById("point4uwy");
  p4uwyRange.addEventListener(
    "input",
    function () {
      p4uwy = parseFloat(p4uwyRange.value);
      document.getElementById("opPoint4uwy").textContent = p4uwy.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P1 UW Twist Z
  p1uwzRange = document.getElementById("point1uwz");
  p1uwzRange.addEventListener(
    "input",
    function () {
      p1uwz = parseFloat(p1uwzRange.value);
      document.getElementById("opPoint1uwz").textContent = p1uwz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P2 UW Twist Z
  p2uwzRange = document.getElementById("point2uwz");
  p2uwzRange.addEventListener(
    "input",
    function () {
      p2uwz = parseFloat(p2uwzRange.value);
      document.getElementById("opPoint2uwz").textContent = p2uwz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P3 UW Twist Z
  p3uwzRange = document.getElementById("point3uwz");
  p3uwzRange.addEventListener(
    "input",
    function () {
      p3uwz = parseFloat(p3uwzRange.value);
      document.getElementById("opPoint3uwz").textContent = p3uwz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );

  // Point P4 UW Twist Z
  p4uwzRange = document.getElementById("point4uwz");
  p4uwzRange.addEventListener(
    "input",
    function () {
      p4uwz = parseFloat(p4uwzRange.value);
      document.getElementById("opPoint4uwz").textContent = p4uwz.toFixed(3);
      computeCoonsBicubicSurface();
    },
    false
  );
  // Tab 4 - Four UW Twists - End

  // Camera Angle
  cameraAngleRange = document.getElementById("cameraAngle");
  cameraAngleRange.addEventListener(
    "input",
    function () {
      cameraAngle = parseFloat(cameraAngleRange.value);
      document.getElementById("opCameraAngle").textContent = cameraAngle;
      handleCameraAngle();
    },
    false
  );

  // Parameter U
  uRange = document.getElementById("uValue");
  uRange.addEventListener(
    "input",
    function () {
      uValue = parseFloat(uRange.value);
      document.getElementById("opUvalue").textContent = uValue.toFixed(3);
      handleUWValue();
    },
    false
  );

  // Parameter W
  wRange = document.getElementById("wValue");
  wRange.addEventListener(
    "input",
    function () {
      wValue = parseFloat(wRange.value);
      document.getElementById("opWvalue").textContent = wValue.toFixed(3);
      handleUWValue();
    },
    false
  );

  document.getElementById("bnSurface1").addEventListener(
    "click",
    function () {
      setupSurface1();
    },
    false
  );

  document.getElementById("bnSurface2").addEventListener(
    "click",
    function () {
      setupSurface2();
    },
    false
  );

  document.getElementById("bnSurface3").addEventListener(
    "click",
    function () {
      setupSurface3();
    },
    false
  );

  document.getElementById("bnSurface4").addEventListener(
    "click",
    function () {
      setupSurface4();
    },
    false
  );

  document.getElementById("bnSurface5").addEventListener(
    "click",
    function () {
      setupSurface5();
    },
    false
  );

  halfCubeSide = 1;

  renderer.setClearColor(new THREE.Color(0x111111));
  renderer.setSize(width, window.innerHeight);

  let axes = new THREE.AxesHelper(0.4);
  scene.add(axes);

  let origin = new THREE.Vector3(0, 0, 0);
  let xPos = new THREE.Vector3(0.4, 0, 0);
  let yPos = new THREE.Vector3(0, 0.4, 0);
  let zPos = new THREE.Vector3(0, 0, 0.4);

  arrowDirection1.subVectors(xPos, origin).normalize();
  arrowHelper1 = new THREE.ArrowHelper(
    arrowDirection1,
    origin,
    0.4,
    0xff0000,
    0.07,
    0.04
  );
  scene.add(arrowHelper1);

  arrowDirection2.subVectors(yPos, origin).normalize();
  arrowHelper2 = new THREE.ArrowHelper(
    arrowDirection2,
    origin,
    0.4,
    0x00ff00,
    0.07,
    0.04
  );
  scene.add(arrowHelper2);

  arrowDirection3.subVectors(zPos, origin).normalize();
  arrowHelper3 = new THREE.ArrowHelper(
    arrowDirection3,
    origin,
    0.4,
    0x0000ff,
    0.07,
    0.04
  );
  scene.add(arrowHelper3);

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  // White directional light at 0.65 intensity shining from the top.
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
  scene.add(directionalLight);

  setupWireframeBox();
  handleCameraAngle();
  handleUWValue();

  document.getElementById("defaultOpen").click();
  document.getElementById("webglOp").appendChild(renderer.domElement);

  animate();
  render();
}

function setupSurface1() {
  p1x = 1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = 1.0;
  p2y = -1.0;
  p2z = 1.0;
  p3x = -1.0;
  p3y = 1.0;
  p3z = -1.0;
  p4x = -1.0;
  p4y = 1.0;
  p4z = 1.0;

  p1ux = 0.0;
  p1uy = 0.0;
  p1uz = 0.0;
  p2ux = 0.0;
  p2uy = 0.0;
  p2uz = 0.0;
  p3ux = 0.0;
  p3uy = 0.0;
  p3uz = 0.0;
  p4ux = 0.0;
  p4uy = 0.0;
  p4uz = 0.0;

  p1wx = 0.0;
  p1wy = 0.0;
  p1wz = 0.0;
  p2wx = 0.0;
  p2wy = 0.0;
  p2wz = 0.0;
  p3wx = 0.0;
  p3wy = 0.0;
  p3wz = 0.0;
  p4wx = 0.0;
  p4wy = 0.0;
  p4wz = 0.0;

  p1uwx = 0.0;
  p1uwy = 0.0;
  p1uwz = 0.0;
  p2uwx = 0.0;
  p2uwy = 0.0;
  p2uwz = 0.0;
  p3uwx = 0.0;
  p3uwy = 0.0;
  p3uwz = 0.0;
  p4uwx = 0.0;
  p4uwy = 0.0;
  p4uwz = 0.0;

  uValue = 0.5;
  wValue = 0.6;
  updateOutputLabels();
  computeCoonsBicubicSurface();
}

function setupSurface2() {
  p1x = 0.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = 0.0;
  p2y = -1.0;
  p2z = 1.0;
  p3x = -0.5;
  p3y = 1.0;
  p3z = -1.0;
  p4x = -0.5;
  p4y = 1.0;
  p4z = 1.0;

  p1ux = 3.0;
  p1uy = 0.0;
  p1uz = 0.0;
  p2ux = 3.0;
  p2uy = 0.0;
  p2uz = 0.0;
  p3ux = 3.0;
  p3uy = 0.0;
  p3uz = 0.0;
  p4ux = 3.0;
  p4uy = 0.0;
  p4uz = 0.0;

  p1wx = 0.0;
  p1wy = 0.0;
  p1wz = 0.0;
  p2wx = 0.0;
  p2wy = 0.0;
  p2wz = 0.0;
  p3wx = 0.0;
  p3wy = 0.0;
  p3wz = 0.0;
  p4wx = 0.0;
  p4wy = 0.0;
  p4wz = 0.0;

  p1uwx = 0.0;
  p1uwy = 0.0;
  p1uwz = 0.0;
  p2uwx = 0.0;
  p2uwy = 0.0;
  p2uwz = 0.0;
  p3uwx = 0.0;
  p3uwy = 0.0;
  p3uwz = 0.0;
  p4uwx = 0.0;
  p4uwy = 0.0;
  p4uwz = 0.0;

  uValue = 0.5;
  wValue = 0.6;
  updateOutputLabels();
  computeCoonsBicubicSurface();
}

function setupSurface3() {
  p1x = 0.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = 0.0;
  p2y = -1.0;
  p2z = 1.0;
  p3x = 0.0;
  p3y = 1.0;
  p3z = -0.5;
  p4x = 0.0;
  p4y = 1.0;
  p4z = 0.5;

  p1ux = 3.0;
  p1uy = 0.0;
  p1uz = 0.0;
  p2ux = 3.0;
  p2uy = 0.0;
  p2uz = 0.0;
  p3ux = -3.0;
  p3uy = 0.0;
  p3uz = 0.0;
  p4ux = -3.0;
  p4uy = 0.0;
  p4uz = 0.0;

  p1wx = 0.0;
  p1wy = 0.0;
  p1wz = 0.0;
  p2wx = 0.0;
  p2wy = 0.0;
  p2wz = 0.0;
  p3wx = 0.0;
  p3wy = 0.0;
  p3wz = 0.0;
  p4wx = 0.0;
  p4wy = 0.0;
  p4wz = 0.0;

  p1uwx = 0.0;
  p1uwy = 0.0;
  p1uwz = 0.0;
  p2uwx = 0.0;
  p2uwy = 0.0;
  p2uwz = 0.0;
  p3uwx = 0.0;
  p3uwy = 0.0;
  p3uwz = 0.0;
  p4uwx = 0.0;
  p4uwy = 0.0;
  p4uwz = 0.0;

  uValue = 0.5;
  wValue = 0.6;
  updateOutputLabels();
  computeCoonsBicubicSurface();
}

function setupSurface4() {
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = -1.0;
  p2y = 1.0;
  p2z = 1.0;
  p3x = 1.0;
  p3y = 1.0;
  p3z = -1.0;
  p4x = 1.0;
  p4y = -1.0;
  p4z = 1.0;

  p1ux = 0.0;
  p1uy = 0.0;
  p1uz = 0.0;
  p2ux = 0.0;
  p2uy = 0.0;
  p2uz = 0.0;
  p3ux = 0.0;
  p3uy = 0.0;
  p3uz = 0.0;
  p4ux = 0.0;
  p4uy = 0.0;
  p4uz = 0.0;

  p1wx = 0.0;
  p1wy = 0.0;
  p1wz = 0.0;
  p2wx = 0.0;
  p2wy = 0.0;
  p2wz = 0.0;
  p3wx = 0.0;
  p3wy = 0.0;
  p3wz = 0.0;
  p4wx = 0.0;
  p4wy = 0.0;
  p4wz = 0.0;

  p1uwx = 0.0;
  p1uwy = 0.0;
  p1uwz = 0.0;
  p2uwx = 0.0;
  p2uwy = 0.0;
  p2uwz = 0.0;
  p3uwx = 0.0;
  p3uwy = 0.0;
  p3uwz = 0.0;
  p4uwx = 0.0;
  p4uwy = 0.0;
  p4uwz = 0.0;

  uValue = 0.5;
  wValue = 0.6;
  updateOutputLabels();
  computeCoonsBicubicSurface();
}

function setupSurface5() {
  p1x = 1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = 1.0;
  p2y = -1.0;
  p2z = 1.0;
  p3x = -1.0;
  p3y = -1.0;
  p3z = -1.0;
  p4x = -1.0;
  p4y = -1.0;
  p4z = 1.0;

  p1ux = 0.0;
  p1uy = 5.0;
  p1uz = 0.0;
  p2ux = 0.0;
  p2uy = 5.0;
  p2uz = 0.0;
  p3ux = 0.0;
  p3uy = -5.0;
  p3uz = 0.0;
  p4ux = 0.0;
  p4uy = -5.0;
  p4uz = 0.0;

  p1wx = 0.0;
  p1wy = 5.0;
  p1wz = 0.0;
  p2wx = 0.0;
  p2wy = -5.0;
  p2wz = 0.0;
  p3wx = 0.0;
  p3wy = 5.0;
  p3wz = 0.0;
  p4wx = 0.0;
  p4wy = -5.0;
  p4wz = 0.0;

  p1uwx = 0.0;
  p1uwy = 0.0;
  p1uwz = 0.0;
  p2uwx = 0.0;
  p2uwy = 0.0;
  p2uwz = 0.0;
  p3uwx = 0.0;
  p3uwy = 0.0;
  p3uwz = 0.0;
  p4uwx = 0.0;
  p4uwy = 0.0;
  p4uwz = 0.0;

  uValue = 0.5;
  wValue = 0.6;
  updateOutputLabels();
  computeCoonsBicubicSurface();
}

function updateOutputLabels() {
  p1xRange.value = p1x;
  p1yRange.value = p1y;
  p1zRange.value = p1z;
  p2xRange.value = p2x;
  p2yRange.value = p2y;
  p2zRange.value = p2z;
  p3xRange.value = p3x;
  p3yRange.value = p3y;
  p3zRange.value = p3z;
  p4xRange.value = p4x;
  p4yRange.value = p4y;
  p4zRange.value = p4z;

  document.getElementById("opPoint1x").textContent = p1x.toFixed(3);
  document.getElementById("opPoint1y").textContent = p1y.toFixed(3);
  document.getElementById("opPoint1z").textContent = p1z.toFixed(3);

  document.getElementById("opPoint2x").textContent = p2x.toFixed(3);
  document.getElementById("opPoint2y").textContent = p2y.toFixed(3);
  document.getElementById("opPoint2z").textContent = p2z.toFixed(3);

  document.getElementById("opPoint3x").textContent = p3x.toFixed(3);
  document.getElementById("opPoint3y").textContent = p3y.toFixed(3);
  document.getElementById("opPoint3z").textContent = p3z.toFixed(3);

  document.getElementById("opPoint4x").textContent = p4x.toFixed(3);
  document.getElementById("opPoint4y").textContent = p4y.toFixed(3);
  document.getElementById("opPoint4z").textContent = p4z.toFixed(3);

  p1uxRange.value = p1ux;
  p2uxRange.value = p2ux;
  p3uxRange.value = p3ux;
  p4uxRange.value = p4ux;
  p1uyRange.value = p1uy;
  p2uyRange.value = p2uy;
  p3uyRange.value = p3uy;
  p4uyRange.value = p4uy;
  p1uzRange.value = p1uz;
  p2uzRange.value = p2uz;
  p3uzRange.value = p3uz;
  p4uzRange.value = p4uz;

  document.getElementById("opPoint1ux").textContent = p1ux.toFixed(3);
  document.getElementById("opPoint1uy").textContent = p1uy.toFixed(3);
  document.getElementById("opPoint1uz").textContent = p1uz.toFixed(3);

  document.getElementById("opPoint2ux").textContent = p2ux.toFixed(3);
  document.getElementById("opPoint2uy").textContent = p2uy.toFixed(3);
  document.getElementById("opPoint2uz").textContent = p2uz.toFixed(3);

  document.getElementById("opPoint3ux").textContent = p3ux.toFixed(3);
  document.getElementById("opPoint3uy").textContent = p3uy.toFixed(3);
  document.getElementById("opPoint3uz").textContent = p3uz.toFixed(3);

  document.getElementById("opPoint4ux").textContent = p4ux.toFixed(3);
  document.getElementById("opPoint4uy").textContent = p4uy.toFixed(3);
  document.getElementById("opPoint4uz").textContent = p4uz.toFixed(3);

  p1wxRange.value = p1wx;
  p2wxRange.value = p2wx;
  p3wxRange.value = p3wx;
  p4wxRange.value = p4wx;
  p1wyRange.value = p1wy;
  p2wyRange.value = p2wy;
  p3wyRange.value = p3wy;
  p4wyRange.value = p4wy;
  p1wzRange.value = p1wz;
  p2wzRange.value = p2wz;
  p3wzRange.value = p3wz;
  p4wzRange.value = p4wz;

  document.getElementById("opPoint1wx").textContent = p1wx.toFixed(3);
  document.getElementById("opPoint1wy").textContent = p1wy.toFixed(3);
  document.getElementById("opPoint1wz").textContent = p1wz.toFixed(3);

  document.getElementById("opPoint2wx").textContent = p2wx.toFixed(3);
  document.getElementById("opPoint2wy").textContent = p2wy.toFixed(3);
  document.getElementById("opPoint2wz").textContent = p2wz.toFixed(3);

  document.getElementById("opPoint3wx").textContent = p3wx.toFixed(3);
  document.getElementById("opPoint3wy").textContent = p3wy.toFixed(3);
  document.getElementById("opPoint3wz").textContent = p3wz.toFixed(3);

  document.getElementById("opPoint4wx").textContent = p4wx.toFixed(3);
  document.getElementById("opPoint4wy").textContent = p4wy.toFixed(3);
  document.getElementById("opPoint4wz").textContent = p4wz.toFixed(3);

  p1uwxRange.value = p1uwx;
  p2uwxRange.value = p2uwx;
  p3uwxRange.value = p3uwx;
  p4uwxRange.value = p4uwx;
  p1uwyRange.value = p1uwy;
  p2uwyRange.value = p2uwy;
  p3uwyRange.value = p3uwy;
  p4uwyRange.value = p4uwy;
  p1uwzRange.value = p1uwz;
  p2uwzRange.value = p2uwz;
  p3uwzRange.value = p3uwz;
  p4uwzRange.value = p4uwz;

  document.getElementById("opPoint1uwx").textContent = p1uwx.toFixed(3);
  document.getElementById("opPoint1uwy").textContent = p1uwy.toFixed(3);
  document.getElementById("opPoint1uwz").textContent = p1uwz.toFixed(3);

  document.getElementById("opPoint2uwx").textContent = p2uwx.toFixed(3);
  document.getElementById("opPoint2uwy").textContent = p2uwy.toFixed(3);
  document.getElementById("opPoint2uwz").textContent = p2uwz.toFixed(3);

  document.getElementById("opPoint3uwx").textContent = p3uwx.toFixed(3);
  document.getElementById("opPoint3uwy").textContent = p3uwy.toFixed(3);
  document.getElementById("opPoint3uwz").textContent = p3uwz.toFixed(3);

  document.getElementById("opPoint4uwx").textContent = p4uwx.toFixed(3);
  document.getElementById("opPoint4uwy").textContent = p4uwy.toFixed(3);
  document.getElementById("opPoint4uwz").textContent = p4uwz.toFixed(3);
}

function initializeValues() {
  p1x = 1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = 1.0;
  p2y = -1.0;
  p2z = 1.0;
  p3x = 1.0;
  p3y = 1.0;
  p3z = -1.0;
  p4x = -1.0;
  p4y = 1.0;
  p4z = 1.0;

  p1ux = 0.2;
  p1uy = 0.3;
  p1uz = 0.6;
  p2ux = 3.0;
  p2uy = 4.0;
  p2uz = 0.0;
  p3ux = 0.0;
  p3uy = 3.0;
  p3uz = -2.7;
  p4ux = 1.0;
  p4uy = 1.0;
  p4uz = 1.0;

  p1wx = -1.0;
  p1wy = -1.0;
  p1wz = -1.0;
  p2wx = 0.0;
  p2wy = 1.0;
  p2wz = 1.0;
  p3wx = 0.5;
  p3wy = 0.5;
  p3wz = 0.7;
  p4wx = 0.0;
  p4wy = 0.0;
  p4wz = 5.0;

  p1uwx = 0.5;
  p1uwy = 0.0;
  p1uwz = 0.6;
  p2uwx = 0.5;
  p2uwy = 0.2;
  p2uwz = -0.6;
  p3uwx = 0.0;
  p3uwy = 0.0;
  p3uwz = 0.0;
  p4uwx = -0.5;
  p4uwy = -0.5;
  p4uwz = -0.6;

  uValue = 0.5;
  wValue = 0.6;

  step = 1.0 / noDivisions;
}

function handleWireframe() {
  computeCoonsBicubicSurface();
}

function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
  let pageCurrent;

  if (pageName === "corners") {
    pageCurrent = "corners";
    computeCoonsBicubicSurface();
  } else if (pageName == "utangents") {
    pageCurrent = "utangents";
    computeCoonsBicubicSurface();
  } else if (pageName == "wtangents") {
    pageCurrent = "vtangents";
    computeCoonsBicubicSurface();
  } else {
    pageCurrent = "uwtwists";
    computeCoonsBicubicSurface();
  }
}

function setupFourPoints() {
  scene.remove(point1);
  scene.remove(point2);
  scene.remove(point3);
  scene.remove(point4);

  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);

  let sphereMaterialRed = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
  });

  let sphereMaterialGreen = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: false,
  });

  let sphereMaterialBlue = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: false,
  });

  let sphereMaterialYellow = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: false,
  });

  point1 = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
  point1.position.x = p1x;
  point1.position.y = p1y;
  point1.position.z = p1z;

  point2 = new THREE.Mesh(sphereGeometry, sphereMaterialGreen);
  point2.position.x = p2x;
  point2.position.y = p2y;
  point2.position.z = p2z;

  point3 = new THREE.Mesh(sphereGeometry, sphereMaterialBlue);
  point3.position.x = p3x;
  point3.position.y = p3y;
  point3.position.z = p3z;

  point4 = new THREE.Mesh(sphereGeometry, sphereMaterialYellow);
  point4.position.x = p4x;
  point4.position.y = p4y;
  point4.position.z = p4z;

  scene.add(point1);
  scene.add(point2);
  scene.add(point3);
  scene.add(point4);
}

function handleUWValue() {
  scene.remove(pointUW);

  uVal = parseFloat(uRange.value);
  wVal = parseFloat(wRange.value);
  let pt = computePointOnSurface(uVal, wVal);
  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
  });
  pointUW = new THREE.Mesh(sphereGeometry, sphereMaterial);
  pointUW.position.x = pt.xVal;
  pointUW.position.y = pt.yVal;
  pointUW.position.z = pt.zVal;

  scene.add(pointUW);
}

// This is where all the magic happens. These formulas, taken from the section
// on Coons Bicubic Surface from the book by Rogers and Adams, "Mathematical Elements
// for Computer Graphics", do the calculations to get the physical coordinates of the
// point in space characterized by any value of u or w (both in the range [0,1]).
// These points are then added to the mesh as vertices, and then the triangles formed
// from these points, are added to the mesh as faces.
function computePointOnSurface(uVal, wVal) {
  let u2, u3, w2, w3;
  let f1u, f2u, f3u, f4u, f1w, f2w, f3w, f4w;
  let valueX, valueY, valueZ;
  let valx1, valx2, valx3, valx4;
  let valy1, valy2, valy3, valy4;
  let valz1, valz2, valz3, valz4;

  w2 = wVal * wVal;
  w3 = w2 * wVal;
  f1w = 2.0 * w3 - 3 * w2 + 1.0;
  f2w = -2.0 * w3 + 3.0 * w2;
  f3w = w3 - 2.0 * w2 + wVal;
  f4w = w3 - w2;
  u2 = uVal * uVal;
  u3 = u2 * uVal;
  f1u = 2.0 * u3 - 3 * u2 + 1.0;
  f2u = -2.0 * u3 + 3.0 * u2;
  f3u = u3 - 2.0 * u2 + uVal;
  f4u = u3 - u2;

  valx1 = f1u * (p1x * f1w + p2x * f2w + p1wx * f3w + p2wx * f4w);
  valx2 = f2u * (p3x * f1w + p4x * f2w + p3wx * f3w + p4wx * f4w);
  valx3 = f3u * (p1ux * f1w + p2ux * f2w + p1uwx * f3w + p2uwx * f4w);
  valx4 = f4u * (p3ux * f1w + p4ux * f2w + p3uwx * f3w + p4uwx * f4w);
  valueX = valx1 + valx2 + valx3 + valx4;

  valy1 = f1u * (p1y * f1w + p2y * f2w + p1wy * f3w + p2wy * f4w);
  valy2 = f2u * (p3y * f1w + p4y * f2w + p3wy * f3w + p4wy * f4w);
  valy3 = f3u * (p1uy * f1w + p2uy * f2w + p1uwy * f3w + p2uwy * f4w);
  valy4 = f4u * (p3uy * f1w + p4uy * f2w + p3uwy * f3w + p4uwy * f4w);
  valueY = valy1 + valy2 + valy3 + valy4;

  valz1 = f1u * (p1z * f1w + p2z * f2w + p1wz * f3w + p2wz * f4w);
  valz2 = f2u * (p3z * f1w + p4z * f2w + p3wz * f3w + p4wz * f4w);
  valz3 = f3u * (p1uz * f1w + p2uz * f2w + p1uwz * f3w + p2uwz * f4w);
  valz4 = f4u * (p3uz * f1w + p4uz * f2w + p3uwz * f3w + p4uwz * f4w);
  valueZ = valz1 + valz2 + valz3 + valz4;

  return {
    xVal: valueX,
    yVal: valueY,
    zVal: valueZ,
  };
}

function computeCoonsBicubicSurface() {
  setupFourPoints();
  surfacePoints.length = 0;
  let uVal, wVal;

  for (let j = 0; j <= noDivisions; ++j) {
    wVal = j * step;

    for (let i = 0; i <= noDivisions; ++i) {
      uVal = i * step;
      let pt = computePointOnSurface(uVal, wVal);
      surfacePoints.push(pt.xVal, pt.yVal, pt.zVal);
    }
  }

  renderCoonsBicubicSurface();
  handleUWValue();
}

function renderCoonsBicubicSurface() {
  scene.remove(surfaceMesh);
  scene.remove(lineWire);

  let material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x00ffff,
    emissive: 0x111111,
    dithering: true,
    flatShading: false,
    roughness: 1,
    metalness: 0.15,
    skinning: true,
  });

  let materialLine = new THREE.LineBasicMaterial({
    color: 0x00ffff,
  });

  let geometry = new THREE.BufferGeometry();
  const indices = [];
  indices.length = 0;

  for (let i = 0; i < noDivisions; i++) {
    for (let j = 0; j < noDivisions; j++) {
      const a = i * (noDivisions + 1) + (j + 1);
      const b = i * (noDivisions + 1) + j;
      const c = (i + 1) * (noDivisions + 1) + j;
      const d = (i + 1) * (noDivisions + 1) + (j + 1);

      // generate two faces (triangles) per iteration

      indices.push(a, b, d); // face one
      indices.push(b, c, d); // face two
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(surfacePoints, 3).onUpload(disposeArray)
  );
  geometry.computeVertexNormals();

  if (document.getElementById("wireframe").checked === true) {
    let surfaceWire = new THREE.WireframeGeometry(geometry);
    lineWire = new THREE.LineSegments(surfaceWire, materialLine);
    scene.add(lineWire);
  } else {
    surfaceMesh = new THREE.Mesh(geometry, material);
    scene.add(surfaceMesh);
  }
  render();
}

function disposeArray() {
  this.array = null;
}

function setupWireframeBox() {
  let line1, line2, line3, line4, line5, line6;
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const geometry1 = new THREE.BufferGeometry();

  const geomVertices1 = [];
  geomVertices1.push(halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices1.push(halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices1.push(-halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices1.push(-halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices1.push(halfCubeSide, -halfCubeSide, halfCubeSide);

  geometry1.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices1, 3)
  );
  line1 = new THREE.Line(geometry1, material);
  scene.add(line1);

  const geometry2 = new THREE.BufferGeometry();
  const geomVertices2 = [];
  geomVertices2.push(halfCubeSide, halfCubeSide, halfCubeSide);
  geomVertices2.push(halfCubeSide, halfCubeSide, -halfCubeSide);
  geomVertices2.push(-halfCubeSide, halfCubeSide, -halfCubeSide);
  geomVertices2.push(-halfCubeSide, halfCubeSide, halfCubeSide);
  geomVertices2.push(halfCubeSide, halfCubeSide, halfCubeSide);

  geometry2.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices2, 3)
  );
  line2 = new THREE.Line(geometry2, material);
  scene.add(line2);

  const geometry3 = new THREE.BufferGeometry();
  const geomVertices3 = [];
  geomVertices3.push(halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices3.push(halfCubeSide, halfCubeSide, halfCubeSide);

  geometry3.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices3, 3)
  );
  line3 = new THREE.Line(geometry3, material);
  scene.add(line3);

  const geometry4 = new THREE.BufferGeometry();
  const geomVertices4 = [];
  geomVertices4.push(halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices4.push(halfCubeSide, halfCubeSide, -halfCubeSide);

  geometry4.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices4, 3)
  );
  line4 = new THREE.Line(geometry4, material);
  scene.add(line4);

  const geometry5 = new THREE.BufferGeometry();
  const geomVertices5 = [];

  geomVertices5.push(-halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices5.push(-halfCubeSide, halfCubeSide, -halfCubeSide);

  geometry5.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices5, 3)
  );
  line5 = new THREE.Line(geometry5, material);
  scene.add(line5);

  const geometry6 = new THREE.BufferGeometry();
  const geomVertices6 = [];
  geomVertices6.push(-halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices6.push(-halfCubeSide, halfCubeSide, halfCubeSide);

  geometry6.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices6, 3)
  );
  line6 = new THREE.Line(geometry6, material);
  scene.add(line6);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function handleCameraAngle() {
  let angle = (cameraAngle * Math.PI) / 180.0;
  let xCam = camRadius * Math.cos(angle);
  let zCam = camRadius * Math.sin(angle);
  let yHeight = 3;
  camera.position.set(xCam, yHeight, zCam);
  camera.lookAt(scene.position);
  render();
}

function onResize() {
  width = (7 * window.innerWidth) / 10;
  camera.aspect = width / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(width, window.innerHeight);
  render();
}

function render() {
  renderer.render(scene, camera);
}
