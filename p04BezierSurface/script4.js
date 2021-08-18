// HTML Program to draw and manipulate a Bezier 4 x 4 Surface
// Written by Amarnath S, amarnaths.codeproject@gmail.com, July 2019
// Revised August 2021. Fixed an issue with computation of normals.
//  Now, Three.js does the normal computations.

/* Requirements:
   1. Should enable the user to modify the x, y, z coordinates of the 16 control points
       forming a 4 x 4 grid of control points for the Bezier Surface.
       The range for coordinates of the corner points should be [-1,1]. For the middle 
       points, the range should be [-3, 3]. The user should be able to modify these 
       through sliders.
   2. Should display the Bezier 4 x 4 Surface on the screen, and this surface should 
      change dynamically as the user modifies any of the values using sliders. 
      Perspective View. Should display a wireframe of the surface if the 
      Wireframe checkbox is checked. 
   3. Should display the bounding box of dimension 2 units, centred at the origin.
   4. Should enable the user to modify the camera angle (degrees), from which 
      viewing is done.
   5. Should enable the user to modify the u, w values of a chosen point, and should 
      display a moving point on the surface as the user modifies these values 
      using the sliders.
   6. All user input should be via sliders.
   7. Should use WebGL, in the form of three.js. 

    Tested on Chrome, Firefox and Edge, on Windows.
    Uses WebGL as available in three.js
 */

"option strict";

let p00x, p01x, p02x, p03x, p00y, p01y, p02y, p03y, p00z, p01z, p02z, p03z;
let p10x, p11x, p12x, p13x, p10y, p11y, p12y, p13y, p10z, p11z, p12z, p13z;
let p20x, p21x, p22x, p23x, p20y, p21y, p22y, p23y, p20z, p21z, p22z, p23z;
let p30x, p31x, p32x, p33x, p30y, p31y, p32y, p33y, p30z, p31z, p32z, p33z;
let p00xRange, p01xRange, p02xRange, p03xRange;
let p00yRange, p01yRange, p02yRange, p03yRange;
let p00zRange, p01zRange, p02zRange, p03zRange;
let p10xRange, p11xRange, p12xRange, p13xRange;
let p10yRange, p11yRange, p12yRange, p13yRange;
let p10zRange, p11zRange, p12zRange, p13zRange;
let p20xRange, p21xRange, p22xRange, p23xRange;
let p20yRange, p21yRange, p22yRange, p23yRange;
let p20zRange, p21zRange, p22zRange, p23zRange;
let p30xRange, p31xRange, p32xRange, p33xRange;
let p30yRange, p31yRange, p32yRange, p33yRange;
let p30zRange, p31zRange, p32zRange, p33zRange;
let uValue, wValue, uRange, wRange;
let scene, camera, renderer;
let cameraAngle, camRadius;
let halfCubeSize;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();
let points = [];
let surfacePoints = [];
let point00, point01, point02, point03, point10, point11, point12, point13;
let point20, point21, point22, point23, point30, point31, point32, point33;
let pointUW;
let line1, line2, line3, line4, line5, line6;
let lineControl1, lineControl2, lineControl3, lineControl4, lineControl5;
let noDivisions = 30;
let step;
let surfaceMesh, lineWire;

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
  renderer = new THREE.WebGLRenderer({ antialias: true });

  window.addEventListener("resize", onResize, false);

  wireCheck = document.getElementById("wireframe");
  wireCheck.addEventListener("click", handleWireframe, false);

  cameraAngle = 25;
  camRadius = 5;

  halfCubeSide = 1;

  // There is a more efficient way of writing the following code, using arrays.
  // For this project, I will use the long form of code. For another project
  // NURBS Surface, I will use a much shorter form of code.

  // Tab 1 - Line 1 - start
  // Point P00 X
  p00xRange = document.getElementById("point00x");
  p00xRange.addEventListener(
    "input",
    function () {
      p00x = parseFloat(p00xRange.value);
      document.getElementById("opPoint00x").textContent = p00x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P01 X
  p01xRange = document.getElementById("point01x");
  p01xRange.addEventListener(
    "input",
    function () {
      p01x = parseFloat(p01xRange.value);
      document.getElementById("opPoint01x").textContent = p01x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P02 X
  p02xRange = document.getElementById("point02x");
  p02xRange.addEventListener(
    "input",
    function () {
      p02x = parseFloat(p02xRange.value);
      document.getElementById("opPoint02x").textContent = p02x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P03 X
  p03xRange = document.getElementById("point03x");
  p03xRange.addEventListener(
    "input",
    function () {
      p03x = parseFloat(p03xRange.value);
      document.getElementById("opPoint03x").textContent = p03x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P00 Y
  p00yRange = document.getElementById("point00y");
  p00yRange.addEventListener(
    "input",
    function () {
      p00y = parseFloat(p00yRange.value);
      document.getElementById("opPoint00y").textContent = p00y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P01 Y
  p01yRange = document.getElementById("point01y");
  p01yRange.addEventListener(
    "input",
    function () {
      p01y = parseFloat(p01yRange.value);
      document.getElementById("opPoint01y").textContent = p01y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P02 Y
  p02yRange = document.getElementById("point02y");
  p02yRange.addEventListener(
    "input",
    function () {
      p02y = parseFloat(p02yRange.value);
      document.getElementById("opPoint02y").textContent = p02y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P03 Y
  p03yRange = document.getElementById("point03y");
  p03yRange.addEventListener(
    "input",
    function () {
      p03y = parseFloat(p03yRange.value);
      document.getElementById("opPoint03y").textContent = p03y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P00 Z
  p00zRange = document.getElementById("point00z");
  p00zRange.addEventListener(
    "input",
    function () {
      p00z = parseFloat(p00zRange.value);
      document.getElementById("opPoint00z").textContent = p00z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P01 Z
  p01zRange = document.getElementById("point01z");
  p01zRange.addEventListener(
    "input",
    function () {
      p01z = parseFloat(p01zRange.value);
      document.getElementById("opPoint01z").textContent = p01z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P02 Z
  p02zRange = document.getElementById("point02z");
  p02zRange.addEventListener(
    "input",
    function () {
      p02z = parseFloat(p02zRange.value);
      document.getElementById("opPoint02z").textContent = p02z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P03 Z
  p03zRange = document.getElementById("point03z");
  p03zRange.addEventListener(
    "input",
    function () {
      p03z = parseFloat(p03zRange.value);
      document.getElementById("opPoint03z").textContent = p03z.toFixed(3);
      computeBezierSurface();
    },
    false
  );
  // Tab 1 - Line 1 - end

  // Tab 2 - Line 2 - start
  // Point P10 X
  p10xRange = document.getElementById("point10x");
  p10xRange.addEventListener(
    "input",
    function () {
      p10x = parseFloat(p10xRange.value);
      document.getElementById("opPoint10x").textContent = p10x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P11 X
  p11xRange = document.getElementById("point11x");
  p11xRange.addEventListener(
    "input",
    function () {
      p11x = parseFloat(p11xRange.value);
      document.getElementById("opPoint11x").textContent = p11x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P12 X
  p12xRange = document.getElementById("point12x");
  p12xRange.addEventListener(
    "input",
    function () {
      p12x = parseFloat(p12xRange.value);
      document.getElementById("opPoint12x").textContent = p12x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P13 X
  p13xRange = document.getElementById("point13x");
  p13xRange.addEventListener(
    "input",
    function () {
      p13x = parseFloat(p13xRange.value);
      document.getElementById("opPoint13x").textContent = p13x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P10 Y
  p10yRange = document.getElementById("point10y");
  p10yRange.addEventListener(
    "input",
    function () {
      p10y = parseFloat(p10yRange.value);
      document.getElementById("opPoint10y").textContent = p10y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P11 Y
  p11yRange = document.getElementById("point11y");
  p11yRange.addEventListener(
    "input",
    function () {
      p11y = parseFloat(p11yRange.value);
      document.getElementById("opPoint11y").textContent = p11y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P12 Y
  p12yRange = document.getElementById("point12y");
  p12yRange.addEventListener(
    "input",
    function () {
      p12y = parseFloat(p12yRange.value);
      document.getElementById("opPoint12y").textContent = p12y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P13 Y
  p13yRange = document.getElementById("point13y");
  p13yRange.addEventListener(
    "input",
    function () {
      p13y = parseFloat(p13yRange.value);
      document.getElementById("opPoint13y").textContent = p13y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P10 Z
  p10zRange = document.getElementById("point10z");
  p10zRange.addEventListener(
    "input",
    function () {
      p10z = parseFloat(p10zRange.value);
      document.getElementById("opPoint10z").textContent = p10z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P11 Z
  p11zRange = document.getElementById("point11z");
  p11zRange.addEventListener(
    "input",
    function () {
      p11z = parseFloat(p11zRange.value);
      document.getElementById("opPoint11z").textContent = p11z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P12 Z
  p12zRange = document.getElementById("point12z");
  p12zRange.addEventListener(
    "input",
    function () {
      p12z = parseFloat(p12zRange.value);
      document.getElementById("opPoint12z").textContent = p12z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P13 Z
  p13zRange = document.getElementById("point13z");
  p13zRange.addEventListener(
    "input",
    function () {
      p13z = parseFloat(p13zRange.value);
      document.getElementById("opPoint13z").textContent = p13z.toFixed(3);
      computeBezierSurface();
    },
    false
  );
  // Tab 2 - Line 2 - end

  // Tab 3 - Line 3 - start
  // Point P20 X
  p20xRange = document.getElementById("point20x");
  p20xRange.addEventListener(
    "input",
    function () {
      p20x = parseFloat(p20xRange.value);
      document.getElementById("opPoint20x").textContent = p20x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P21 X
  p21xRange = document.getElementById("point21x");
  p21xRange.addEventListener(
    "input",
    function () {
      p21x = parseFloat(p21xRange.value);
      document.getElementById("opPoint21x").textContent = p21x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P22 X
  p22xRange = document.getElementById("point22x");
  p22xRange.addEventListener(
    "input",
    function () {
      p22x = parseFloat(p22xRange.value);
      document.getElementById("opPoint22x").textContent = p22x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P23 X
  p23xRange = document.getElementById("point23x");
  p23xRange.addEventListener(
    "input",
    function () {
      p23x = parseFloat(p23xRange.value);
      document.getElementById("opPoint23x").textContent = p23x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P20 Y
  p20yRange = document.getElementById("point20y");
  p20yRange.addEventListener(
    "input",
    function () {
      p20y = parseFloat(p20yRange.value);
      document.getElementById("opPoint20y").textContent = p20y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P21 Y
  p21yRange = document.getElementById("point21y");
  p21yRange.addEventListener(
    "input",
    function () {
      p21y = parseFloat(p21yRange.value);
      document.getElementById("opPoint21y").textContent = p21y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P22 Y
  p22yRange = document.getElementById("point22y");
  p22yRange.addEventListener(
    "input",
    function () {
      p22y = parseFloat(p22yRange.value);
      document.getElementById("opPoint22y").textContent = p22y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P23 Y
  p23yRange = document.getElementById("point23y");
  p23yRange.addEventListener(
    "input",
    function () {
      p23y = parseFloat(p23yRange.value);
      document.getElementById("opPoint23y").textContent = p23y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P20 Z
  p20zRange = document.getElementById("point20z");
  p20zRange.addEventListener(
    "input",
    function () {
      p20z = parseFloat(p20zRange.value);
      document.getElementById("opPoint20z").textContent = p20z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P21 Z
  p21zRange = document.getElementById("point21z");
  p21zRange.addEventListener(
    "input",
    function () {
      p21z = parseFloat(p21zRange.value);
      document.getElementById("opPoint21z").textContent = p21z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P22 Z
  p22zRange = document.getElementById("point22z");
  p22zRange.addEventListener(
    "input",
    function () {
      p22z = parseFloat(p22zRange.value);
      document.getElementById("opPoint22z").textContent = p22z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P23 Z
  p23zRange = document.getElementById("point23z");
  p23zRange.addEventListener(
    "input",
    function () {
      p23z = parseFloat(p23zRange.value);
      document.getElementById("opPoint23z").textContent = p23z.toFixed(3);
      computeBezierSurface();
    },
    false
  );
  // Tab 3 - Line 3 - end

  // Tab 4 - Line 4 - start
  // Point P30 X
  p30xRange = document.getElementById("point30x");
  p30xRange.addEventListener(
    "input",
    function () {
      p30x = parseFloat(p30xRange.value);
      document.getElementById("opPoint30x").textContent = p30x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P31 X
  p31xRange = document.getElementById("point31x");
  p31xRange.addEventListener(
    "input",
    function () {
      p31x = parseFloat(p31xRange.value);
      document.getElementById("opPoint31x").textContent = p31x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P32 X
  p32xRange = document.getElementById("point32x");
  p32xRange.addEventListener(
    "input",
    function () {
      p32x = parseFloat(p32xRange.value);
      document.getElementById("opPoint32x").textContent = p32x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P33 X
  p33xRange = document.getElementById("point33x");
  p33xRange.addEventListener(
    "input",
    function () {
      p33x = parseFloat(p33xRange.value);
      document.getElementById("opPoint33x").textContent = p33x.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P30 Y
  p30yRange = document.getElementById("point30y");
  p30yRange.addEventListener(
    "input",
    function () {
      p30y = parseFloat(p30yRange.value);
      document.getElementById("opPoint30y").textContent = p30y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P31 Y
  p31yRange = document.getElementById("point31y");
  p31yRange.addEventListener(
    "input",
    function () {
      p31y = parseFloat(p31yRange.value);
      document.getElementById("opPoint31y").textContent = p31y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P32 Y
  p32yRange = document.getElementById("point32y");
  p32yRange.addEventListener(
    "input",
    function () {
      p32y = parseFloat(p32yRange.value);
      document.getElementById("opPoint32y").textContent = p32y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P33 Y
  p33yRange = document.getElementById("point33y");
  p33yRange.addEventListener(
    "input",
    function () {
      p33y = parseFloat(p33yRange.value);
      document.getElementById("opPoint33y").textContent = p33y.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P30 Z
  p30zRange = document.getElementById("point30z");
  p30zRange.addEventListener(
    "input",
    function () {
      p30z = parseFloat(p30zRange.value);
      document.getElementById("opPoint30z").textContent = p30z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P31 Z
  p31zRange = document.getElementById("point31z");
  p31zRange.addEventListener(
    "input",
    function () {
      p31z = parseFloat(p31zRange.value);
      document.getElementById("opPoint31z").textContent = p31z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P32 Z
  p32zRange = document.getElementById("point32z");
  p32zRange.addEventListener(
    "input",
    function () {
      p32z = parseFloat(p32zRange.value);
      document.getElementById("opPoint32z").textContent = p32z.toFixed(3);
      computeBezierSurface();
    },
    false
  );

  // Point P33 Z
  p33zRange = document.getElementById("point33z");
  p33zRange.addEventListener(
    "input",
    function () {
      p33z = parseFloat(p33zRange.value);
      document.getElementById("opPoint33z").textContent = p33z.toFixed(3);
      computeBezierSurface();
    },
    false
  );
  // Tab 4 - Line 4 - end

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

  setupCubePoints();
  setupWireframeBox();
  handleCameraAngle();
  handleUWValue();

  document.getElementById("defaultOpen").click();

  document.getElementById("webglOp").appendChild(renderer.domElement);

  animate();
  render();
}

function initializeValues() {
  p00x = 1.0;
  p00y = -1.0;
  p00z = -1.0;
  p01x = 0.1;
  p01y = -0.3;
  p01z = -1.0;
  p02x = 0.1;
  p02y = 0.3;
  p02z = -1.0;
  p03x = -1.0;
  p03y = 1.0;
  p03z = -1.0;

  p10x = 0.1;
  p10y = -1.0;
  p10z = -0.3;
  p11x = 0.1;
  p11y = -0.3;
  p11z = -0.3;
  p12x = 0.1;
  p12y = 0.3;
  p12z = -0.3;
  p13x = 0.1;
  p13y = 1.0;
  p13z = -0.3;

  p20x = 0.1;
  p20y = -1.0;
  p20z = 0.3;
  p21x = 0.1;
  p21y = -0.3;
  p21z = 0.3;
  p22x = 0.1;
  p22y = 0.3;
  p22z = 0.3;
  p23x = 0.1;
  p23y = 1.0;
  p23z = 0.3;

  p30x = -1.0;
  p30y = -1.0;
  p30z = 1.0;
  p31x = 0.1;
  p31y = -0.3;
  p31z = 1.0;
  p32x = 0.1;
  p32y = 0.3;
  p32z = 1.0;
  p33x = 1.0;
  p33y = 1.0;
  p33z = 1.0;

  uValue = 0.5;
  wValue = 0.6;

  step = 1.0 / noDivisions;
}

function setupSurface1() {
  p00x = 1.0;
  p00y = -1.0;
  p00z = -1.0;
  p01x = 0.1;
  p01y = -0.3;
  p01z = -1.0;
  p02x = 0.1;
  p02y = 0.3;
  p02z = -1.0;
  p03x = 1.0;
  p03y = 1.0;
  p03z = -1.0;

  p10x = -1;
  p10y = -1.0;
  p10z = -0.3;
  p11x = -3.0;
  p11y = -0.3;
  p11z = -0.3;
  p12x = -3.0;
  p12y = 0.3;
  p12z = -0.3;
  p13x = -1.0;
  p13y = 1.0;
  p13z = -0.3;

  p20x = -1.0;
  p20y = -1.0;
  p20z = 0.3;
  p21x = -3.0;
  p21y = -0.3;
  p21z = 0.3;
  p22x = -3.0;
  p22y = 0.3;
  p22z = 0.3;
  p23x = -1.0;
  p23y = 1.0;
  p23z = 0.3;

  p30x = 1.0;
  p30y = -1.0;
  p30z = 1.0;
  p31x = 0.1;
  p31y = -0.3;
  p31z = 1.0;
  p32x = 0.1;
  p32y = 0.3;
  p32z = 1.0;
  p33x = 1.0;
  p33y = 1.0;
  p33z = 1.0;

  updateOutputLabels();
  computeBezierSurface();
}

function setupSurface5() {
  p00x = 1.0;
  p00y = 0.0;
  p00z = -1.0;
  p01x = 0.1;
  p01y = -0.3;
  p01z = -1.0;
  p02x = 0.1;
  p02y = 0.3;
  p02z = -1.0;
  p03x = -1.0;
  p03y = 0.0;
  p03z = -1.0;

  p10x = 0.1;
  p10y = -1.0;
  p10z = -0.3;
  p11x = 0.1;
  p11y = -0.3;
  p11z = -0.3;
  p12x = 0.1;
  p12y = 0.3;
  p12z = -0.3;
  p13x = 0.1;
  p13y = 1.0;
  p13z = -0.3;

  p20x = 0.1;
  p20y = -1.0;
  p20z = 0.3;
  p21x = 0.1;
  p21y = -0.3;
  p21z = 0.3;
  p22x = 0.1;
  p22y = 0.3;
  p22z = 0.3;
  p23x = 0.1;
  p23y = 1.0;
  p23z = 0.3;

  p30x = 1.0;
  p30y = 0.0;
  p30z = 1.0;
  p31x = 0.1;
  p31y = -0.3;
  p31z = 1.0;
  p32x = 0.1;
  p32y = 0.3;
  p32z = 1.0;
  p33x = -1.0;
  p33y = 0.0;
  p33z = 1.0;

  updateOutputLabels();
  computeBezierSurface();
}

function setupSurface3() {
  p00x = 1.0;
  p00y = 0.0;
  p00z = -1.0;
  p01x = 0.0;
  p01y = 0.0;
  p01z = -1.0;
  p02x = 0.0;
  p02y = 0.0;
  p02z = -1.0;
  p03x = -1.0;
  p03y = 0.0;
  p03z = -1.0;

  p10x = 1.0;
  p10y = 0.0;
  p10z = 0.0;
  p11x = 0.0;
  p11y = 2.0;
  p11z = 0.0;
  p12x = 0.0;
  p12y = 2.0;
  p12z = 0.0;
  p13x = -1.0;
  p13y = 0.0;
  p13z = 0.0;

  p20x = 1.0;
  p20y = 0.0;
  p20z = 0.0;
  p21x = 1.0;
  p21y = -2.0;
  p21z = 0.0;
  p22x = 1.0;
  p22y = -2.0;
  p22z = 0.0;
  p23x = -1.0;
  p23y = 0.0;
  p23z = 0.0;

  p30x = 1.0;
  p30y = 0.0;
  p30z = 1.0;
  p31x = 0.0;
  p31y = 0.0;
  p31z = 1.0;
  p32x = 0.0;
  p32y = 0.0;
  p32z = 1.0;
  p33x = -1.0;
  p33y = 0.0;
  p33z = 1.0;

  updateOutputLabels();
  computeBezierSurface();
}

function setupSurface4() {
  p00x = 1.0;
  p00y = 0.0;
  p00z = -1.0;
  p01x = 0.0;
  p01y = 0.0;
  p01z = -1.0;
  p02x = 0.0;
  p02y = 0.0;
  p02z = -1.0;
  p03x = -1.0;
  p03y = 0.0;
  p03z = -1.0;

  p10x = 1.0;
  p10y = 0.0;
  p10z = 0.0;
  p11x = 0.0;
  p11y = 2.0;
  p11z = 0.0;
  p12x = 0.0;
  p12y = 2.0;
  p12z = 0.0;
  p13x = -1.0;
  p13y = 0.0;
  p13z = 0.0;

  p20x = 1.0;
  p20y = 0.0;
  p20z = 0.0;
  p21x = 0.0;
  p21y = 2.0;
  p21z = 0.0;
  p22x = 0.0;
  p22y = 2.0;
  p22z = 0.0;
  p23x = -1.0;
  p23y = 0.0;
  p23z = 0.0;

  p30x = 1.0;
  p30y = 0.0;
  p30z = 1.0;
  p31x = 0.0;
  p31y = 0.0;
  p31z = 1.0;
  p32x = 0.0;
  p32y = 0.0;
  p32z = 1.0;
  p33x = -1.0;
  p33y = 0.0;
  p33z = 1.0;

  updateOutputLabels();
  computeBezierSurface();
}

function setupSurface2() {
  p00x = 1.0;
  p00y = -1.0;
  p00z = -1.0;
  p01x = 1.0;
  p01y = -0.3;
  p01z = -1.0;
  p02x = 1.0;
  p02y = 0.3;
  p02z = -1.0;
  p03x = 1.0;
  p03y = 1.0;
  p03z = -1.0;

  p10x = -1.0;
  p10y = -1.0;
  p10z = -0.3;
  p11x = -3.0;
  p11y = -0.3;
  p11z = -0.3;
  p12x = -3.0;
  p12y = 0.3;
  p12z = -0.3;
  p13x = 1.0;
  p13y = 1.0;
  p13z = -0.3;

  p20x = 1.0;
  p20y = -1.0;
  p20z = 0.3;
  p21x = -3.0;
  p21y = -0.3;
  p21z = 0.3;
  p22x = -3.0;
  p22y = 0.3;
  p22z = 0.3;
  p23x = 1.0;
  p23y = 1.0;
  p23z = 0.3;

  p30x = 1.0;
  p30y = -1.0;
  p30z = 1.0;
  p31x = 1.0;
  p31y = -0.3;
  p31z = 1.0;
  p32x = 1.0;
  p32y = 0.3;
  p32z = 1.0;
  p33x = 1.0;
  p33y = 1.0;
  p33z = 1.0;
  updateOutputLabels();
  computeBezierSurface();
}

function updateOutputLabels() {
  p00xRange.value = p00x;
  p00yRange.value = p00y;
  p00zRange.value = p00z;
  p01xRange.value = p01x;
  p01yRange.value = p01y;
  p01zRange.value = p01z;
  p02xRange.value = p02x;
  p02yRange.value = p02y;
  p02zRange.value = p02z;
  p03xRange.value = p03x;
  p03yRange.value = p03y;
  p03zRange.value = p03z;

  p10xRange.value = p10x;
  p10yRange.value = p10y;
  p10zRange.value = p10z;
  p11xRange.value = p11x;
  p11yRange.value = p11y;
  p11zRange.value = p11z;
  p12xRange.value = p12x;
  p12yRange.value = p12y;
  p12zRange.value = p12z;
  p13xRange.value = p13x;
  p13yRange.value = p13y;
  p13zRange.value = p13z;

  p20xRange.value = p20x;
  p20yRange.value = p20y;
  p20zRange.value = p20z;
  p21xRange.value = p21x;
  p21yRange.value = p21y;
  p21zRange.value = p21z;
  p22xRange.value = p22x;
  p22yRange.value = p22y;
  p22zRange.value = p22z;
  p23xRange.value = p23x;
  p23yRange.value = p23y;
  p23zRange.value = p23z;

  p30xRange.value = p30x;
  p30yRange.value = p30y;
  p30zRange.value = p30z;
  p31xRange.value = p31x;
  p31yRange.value = p31y;
  p31zRange.value = p31z;
  p32xRange.value = p32x;
  p32yRange.value = p32y;
  p32zRange.value = p32z;
  p33xRange.value = p33x;
  p33yRange.value = p33y;
  p33zRange.value = p33z;

  document.getElementById("opPoint00x").textContent = p00x.toFixed(3);
  document.getElementById("opPoint01x").textContent = p01x.toFixed(3);
  document.getElementById("opPoint02x").textContent = p02x.toFixed(3);
  document.getElementById("opPoint03x").textContent = p03x.toFixed(3);
  document.getElementById("opPoint00y").textContent = p00y.toFixed(3);
  document.getElementById("opPoint01y").textContent = p01y.toFixed(3);
  document.getElementById("opPoint02y").textContent = p02y.toFixed(3);
  document.getElementById("opPoint03y").textContent = p03y.toFixed(3);
  document.getElementById("opPoint00z").textContent = p00z.toFixed(3);
  document.getElementById("opPoint01z").textContent = p01z.toFixed(3);
  document.getElementById("opPoint02z").textContent = p02z.toFixed(3);
  document.getElementById("opPoint03z").textContent = p03z.toFixed(3);

  document.getElementById("opPoint10x").textContent = p10x.toFixed(3);
  document.getElementById("opPoint11x").textContent = p11x.toFixed(3);
  document.getElementById("opPoint12x").textContent = p12x.toFixed(3);
  document.getElementById("opPoint13x").textContent = p13x.toFixed(3);
  document.getElementById("opPoint10y").textContent = p10y.toFixed(3);
  document.getElementById("opPoint11y").textContent = p11y.toFixed(3);
  document.getElementById("opPoint12y").textContent = p12y.toFixed(3);
  document.getElementById("opPoint13y").textContent = p13y.toFixed(3);
  document.getElementById("opPoint10z").textContent = p10z.toFixed(3);
  document.getElementById("opPoint11z").textContent = p11z.toFixed(3);
  document.getElementById("opPoint12z").textContent = p12z.toFixed(3);
  document.getElementById("opPoint13z").textContent = p13z.toFixed(3);

  document.getElementById("opPoint20x").textContent = p20x.toFixed(3);
  document.getElementById("opPoint21x").textContent = p21x.toFixed(3);
  document.getElementById("opPoint22x").textContent = p22x.toFixed(3);
  document.getElementById("opPoint23x").textContent = p23x.toFixed(3);
  document.getElementById("opPoint20y").textContent = p20y.toFixed(3);
  document.getElementById("opPoint21y").textContent = p21y.toFixed(3);
  document.getElementById("opPoint22y").textContent = p22y.toFixed(3);
  document.getElementById("opPoint23y").textContent = p23y.toFixed(3);
  document.getElementById("opPoint20z").textContent = p20z.toFixed(3);
  document.getElementById("opPoint21z").textContent = p21z.toFixed(3);
  document.getElementById("opPoint22z").textContent = p22z.toFixed(3);
  document.getElementById("opPoint23z").textContent = p23z.toFixed(3);

  document.getElementById("opPoint30x").textContent = p30x.toFixed(3);
  document.getElementById("opPoint31x").textContent = p31x.toFixed(3);
  document.getElementById("opPoint32x").textContent = p32x.toFixed(3);
  document.getElementById("opPoint33x").textContent = p33x.toFixed(3);
  document.getElementById("opPoint30y").textContent = p30y.toFixed(3);
  document.getElementById("opPoint31y").textContent = p31y.toFixed(3);
  document.getElementById("opPoint32y").textContent = p32y.toFixed(3);
  document.getElementById("opPoint33y").textContent = p33y.toFixed(3);
  document.getElementById("opPoint30z").textContent = p30z.toFixed(3);
  document.getElementById("opPoint31z").textContent = p31z.toFixed(3);
  document.getElementById("opPoint32z").textContent = p32z.toFixed(3);
  document.getElementById("opPoint33z").textContent = p33z.toFixed(3);
}

function handleWireframe() {
  computeBezierSurface();
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

  if (pageName === "line1") {
    pageCurrent = "line1";
    computeBezierSurface();
  } else if (pageName == "line2") {
    pageCurrent = "line2";
    computeBezierSurface();
  } else if (pageName == "line3") {
    pageCurrent = "line3";
    computeBezierSurface();
  } else {
    pageCurrent = "line4";
    computeBezierSurface();
  }
}

function setupCubePoints() {
  let pt = new THREE.Vector3(halfCubeSide, -halfCubeSide, halfCubeSide); // Point A
  points.push(pt);
  pt = new THREE.Vector3(halfCubeSide, -halfCubeSide, -halfCubeSide); // Point B
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, -halfCubeSide, -halfCubeSide); // Point C
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, -halfCubeSide, halfCubeSide); // Point D
  points.push(pt);
  pt = new THREE.Vector3(halfCubeSide, halfCubeSide, halfCubeSide); // Point E
  points.push(pt);
  pt = new THREE.Vector3(halfCubeSide, halfCubeSide, -halfCubeSide); // Point F
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, halfCubeSide, -halfCubeSide); // Point G
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, halfCubeSide, halfCubeSide); // Point H
  points.push(pt);
  pt = new THREE.Vector3(0, 0, 0); // Point O
  points.push(pt);
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

function setupGrid() {
  scene.remove(point00);
  scene.remove(point01);
  scene.remove(point02);
  scene.remove(point03);

  scene.remove(point10);
  scene.remove(point11);
  scene.remove(point12);
  scene.remove(point13);

  scene.remove(point20);
  scene.remove(point21);
  scene.remove(point22);
  scene.remove(point23);

  scene.remove(point30);
  scene.remove(point31);
  scene.remove(point32);
  scene.remove(point33);

  scene.remove(lineControl1);
  scene.remove(lineControl2);
  scene.remove(lineControl3);
  scene.remove(lineControl4);
  scene.remove(lineControl5);

  let sphereGeometry = new THREE.SphereGeometry(0.015, 20, 20);

  let sphereMaterialRed = new THREE.MeshBasicMaterial({
    color: 0xfa8072,
    wireframe: false,
  });

  let sphereMaterialGreen = new THREE.MeshBasicMaterial({
    color: 0x90ee90,
    wireframe: false,
  });

  let sphereMaterialBlue = new THREE.MeshBasicMaterial({
    color: 0x87cefa,
    wireframe: false,
  });

  let sphereMaterialYellow = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: false,
  });

  // Red Points
  point00 = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
  point00.position.x = p00x;
  point00.position.y = p00y;
  point00.position.z = p00z;

  point01 = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
  point01.position.x = p01x;
  point01.position.y = p01y;
  point01.position.z = p01z;

  point02 = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
  point02.position.x = p02x;
  point02.position.y = p02y;
  point02.position.z = p02z;

  point03 = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
  point03.position.x = p03x;
  point03.position.y = p03y;
  point03.position.z = p03z;

  point00 = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
  point00.position.x = p00x;
  point00.position.y = p00y;
  point00.position.z = p00z;

  // Green Points
  point10 = new THREE.Mesh(sphereGeometry, sphereMaterialGreen);
  point10.position.x = p10x;
  point10.position.y = p10y;
  point10.position.z = p10z;

  point11 = new THREE.Mesh(sphereGeometry, sphereMaterialGreen);
  point11.position.x = p11x;
  point11.position.y = p11y;
  point11.position.z = p11z;

  point12 = new THREE.Mesh(sphereGeometry, sphereMaterialGreen);
  point12.position.x = p12x;
  point12.position.y = p12y;
  point12.position.z = p12z;

  point13 = new THREE.Mesh(sphereGeometry, sphereMaterialGreen);
  point13.position.x = p13x;
  point13.position.y = p13y;
  point13.position.z = p13z;

  // Blue Points
  point20 = new THREE.Mesh(sphereGeometry, sphereMaterialBlue);
  point20.position.x = p20x;
  point20.position.y = p20y;
  point20.position.z = p20z;

  point21 = new THREE.Mesh(sphereGeometry, sphereMaterialBlue);
  point21.position.x = p21x;
  point21.position.y = p21y;
  point21.position.z = p21z;

  point22 = new THREE.Mesh(sphereGeometry, sphereMaterialBlue);
  point22.position.x = p22x;
  point22.position.y = p22y;
  point22.position.z = p22z;

  point23 = new THREE.Mesh(sphereGeometry, sphereMaterialBlue);
  point23.position.x = p23x;
  point23.position.y = p23y;
  point23.position.z = p23z;

  // Yellow Points
  point30 = new THREE.Mesh(sphereGeometry, sphereMaterialYellow);
  point30.position.x = p30x;
  point30.position.y = p30y;
  point30.position.z = p30z;

  point31 = new THREE.Mesh(sphereGeometry, sphereMaterialYellow);
  point31.position.x = p31x;
  point31.position.y = p31y;
  point31.position.z = p31z;

  point32 = new THREE.Mesh(sphereGeometry, sphereMaterialYellow);
  point32.position.x = p32x;
  point32.position.y = p32y;
  point32.position.z = p32z;

  point33 = new THREE.Mesh(sphereGeometry, sphereMaterialYellow);
  point33.position.x = p33x;
  point33.position.y = p33y;
  point33.position.z = p33z;

  scene.add(point00);
  scene.add(point01);
  scene.add(point02);
  scene.add(point03);

  scene.add(point10);
  scene.add(point11);
  scene.add(point12);
  scene.add(point13);

  scene.add(point20);
  scene.add(point21);
  scene.add(point22);
  scene.add(point23);

  scene.add(point30);
  scene.add(point31);
  scene.add(point32);
  scene.add(point33);

  let material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    opacity: 0.25,
    transparent: true,
  });
  let geometry1 = new THREE.BufferGeometry();
  let vertices = [];
  vertices.push(p00x, p00y, p00z);
  vertices.push(p01x, p01y, p01z);
  vertices.push(p02x, p02y, p02z);
  vertices.push(p03x, p03y, p03z);
  vertices.push(p13x, p13y, p13z);
  vertices.push(p23x, p23y, p23z);
  vertices.push(p33x, p33y, p33z);
  vertices.push(p32x, p32y, p32z);
  vertices.push(p31x, p31y, p31z);
  vertices.push(p30x, p30y, p30z);
  vertices.push(p20x, p20y, p20z);
  vertices.push(p10x, p10y, p10z);
  vertices.push(p00x, p00y, p00z);
  geometry1.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  lineControl1 = new THREE.Line(geometry1, material);

  let geometry2 = new THREE.BufferGeometry();
  vertices.length = 0;
  vertices.push(p01x, p01y, p01z);
  vertices.push(p11x, p11y, p11z);
  vertices.push(p21x, p21y, p21z);
  vertices.push(p31x, p31y, p31z);
  geometry2.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  lineControl2 = new THREE.Line(geometry2, material);

  let geometry3 = new THREE.BufferGeometry();
  vertices.length = 0;
  vertices.push(p02x, p02y, p02z);
  vertices.push(p12x, p12y, p12z);
  vertices.push(p22x, p22y, p22z);
  vertices.push(p32x, p32y, p32z);
  geometry3.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  lineControl3 = new THREE.Line(geometry3, material);

  let geometry4 = new THREE.BufferGeometry();
  vertices.length = 0;
  vertices.push(p10x, p10y, p10z);
  vertices.push(p11x, p11y, p11z);
  vertices.push(p12x, p12y, p12z);
  vertices.push(p13x, p13y, p13z);
  geometry4.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  lineControl4 = new THREE.Line(geometry4, material);

  let geometry5 = new THREE.BufferGeometry();
  vertices.length = 0;
  vertices.push(p20x, p20y, p20z);
  vertices.push(p21x, p21y, p21z);
  vertices.push(p22x, p22y, p22z);
  vertices.push(p23x, p23y, p23z);
  geometry5.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  lineControl5 = new THREE.Line(geometry5, material);

  scene.add(lineControl1);
  scene.add(lineControl2);
  scene.add(lineControl3);
  scene.add(lineControl4);
  scene.add(lineControl5);
}

// This is where all the magic happens. This function computes a point on the
//  Bezier Surface. This is an implementation of the formulas from the book by
//  Rogers and Adams, Mathematical Elements for Computer Graphics.
//  The point on the surface corresponding to the values of u and w, is
//  returned by this function.
function computeBezierSurfacePoint(uVal, wVal) {
  let u2, u3, w2, w3;
  u2 = uVal * uVal;
  u3 = uVal * u2;
  w2 = wVal * wVal;
  w3 = wVal * w2;

  // Need to note the following regarding THREE.js Matrix4.
  // When we set the matrix, we set it in row major order.
  // However, when we access the elements of this matrix, these are
  // returned in column major order.
  let matC = new THREE.Matrix4();
  matC.set(-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0);

  let matPx = new THREE.Matrix4();
  matPx.set(
    p00x,
    p10x,
    p20x,
    p30x,
    p01x,
    p11x,
    p21x,
    p31x,
    p02x,
    p12x,
    p22x,
    p32x,
    p03x,
    p13x,
    p23x,
    p33x
  );

  let matPy = new THREE.Matrix4();
  matPy.set(
    p00y,
    p10y,
    p20y,
    p30y,
    p01y,
    p11y,
    p21y,
    p31y,
    p02y,
    p12y,
    p22y,
    p32y,
    p03y,
    p13y,
    p23y,
    p33y
  );

  let matPz = new THREE.Matrix4();
  matPz.set(
    p00z,
    p10z,
    p20z,
    p30z,
    p01z,
    p11z,
    p21z,
    p31z,
    p02z,
    p12z,
    p22z,
    p32z,
    p03z,
    p13z,
    p23z,
    p33z
  );

  let mat1x = new THREE.Matrix4();
  mat1x.multiplyMatrices(matC, matPx);

  let mat1y = new THREE.Matrix4();
  mat1y.multiplyMatrices(matC, matPy);

  let mat1z = new THREE.Matrix4();
  mat1z.multiplyMatrices(matC, matPz);

  let mat2x = new THREE.Matrix4();
  mat2x.multiplyMatrices(mat1x, matC);

  let mat2y = new THREE.Matrix4();
  mat2y.multiplyMatrices(mat1y, matC);

  let mat2z = new THREE.Matrix4();
  mat2z.multiplyMatrices(mat1z, matC);

  // We access the matrix elements in column major order.
  let ex = mat2x.elements;
  let w0x = ex[0] * w3 + ex[4] * w2 + ex[8] * wVal + ex[12];
  let w1x = ex[1] * w3 + ex[5] * w2 + ex[9] * wVal + ex[13];
  let w2x = ex[2] * w3 + ex[6] * w2 + ex[10] * wVal + ex[14];
  let w3x = ex[3] * w3 + ex[7] * w2 + ex[11] * wVal + ex[15];

  let ey = mat2y.elements;
  let w0y = ey[0] * w3 + ey[4] * w2 + ey[8] * wVal + ey[12];
  let w1y = ey[1] * w3 + ey[5] * w2 + ey[9] * wVal + ey[13];
  let w2y = ey[2] * w3 + ey[6] * w2 + ey[10] * wVal + ey[14];
  let w3y = ey[3] * w3 + ey[7] * w2 + ey[11] * wVal + ey[15];

  let ez = mat2z.elements;
  let w0z = ez[0] * w3 + ez[4] * w2 + ez[8] * wVal + ez[12];
  let w1z = ez[1] * w3 + ez[5] * w2 + ez[9] * wVal + ez[13];
  let w2z = ez[2] * w3 + ez[6] * w2 + ez[10] * wVal + ez[14];
  let w3z = ez[3] * w3 + ez[7] * w2 + ez[11] * wVal + ez[15];

  let qx = u3 * w0x + u2 * w1x + uVal * w2x + w3x;
  let qy = u3 * w0y + u2 * w1y + uVal * w2y + w3y;
  let qz = u3 * w0z + u2 * w1z + uVal * w2z + w3z;

  return {
    xVal: qx,
    yVal: qy,
    zVal: qz,
  };
}

function handleUWValue() {
  scene.remove(pointUW);
  let uVal, wVal;
  uVal = parseFloat(uRange.value);
  wVal = parseFloat(wRange.value);
  let pt = computeBezierSurfacePoint(uVal, wVal);

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

function computeBezierSurface() {
  setupGrid();

  surfacePoints.length = 0;
  let uVal, wVal;

  for (let j = 0; j <= noDivisions; ++j) {
    wVal = j * step;
    for (let i = 0; i <= noDivisions; ++i) {
      uVal = i * step;

      let pt = computeBezierSurfacePoint(uVal, wVal);
      //let poi = new THREE.Vector3(pt.xVal, pt.yVal, pt.zVal);
      surfacePoints.push(pt.xVal, pt.yVal, pt.zVal);
    }
  }
  renderSurface();
  handleUWValue();
}

function disposeArray() {
  this.array = null;
}

function renderSurface() {
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

function animate() {
  requestAnimationFrame(animate);
  render();
}

function handleCameraAngle() {
  let angle = (cameraAngle * Math.PI) / 180.0;
  let xCam = camRadius * Math.cos(angle);
  let zCam = camRadius * Math.sin(angle);
  camera.position.set(xCam, 3, zCam);
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
