import {mat4, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import ExpansionRule from './lsystem/ExpansionRule';
import DrawingRule from './lsystem/DrawingRule';
import Turtle from './lsystem/Turtle';
import Mesh from './geometry/Mesh';
import LSystem from './lsystem/LSystem';


/* 
Other plans:
- add lights and/or ornaments 
- randomness in needle angle or ornament color
- gui modifiable (3): light/ornament color, angle of branches, how sparse the needles are (add Fs to Z=[+FF][-FF]FFFFFF)
*/

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Square;
let cylinder: Mesh;
let needle: Mesh;
let light: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let prevAngle: number = 3.0;
let prevBranchSparse: number = 0.0;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  let obj0: string = readTextFile('./src/cylinder.obj');
  cylinder = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  cylinder.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 10.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(2 * i);
      offsetsArray.push(2 * j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"
  cylinder.setInstanceVBOs(offsets, colors);
  cylinder.setNumInstances(n * n);
}

function main() {
  // Initial display for framerate
  // const stats = Stats();
  // stats.setMode(0);
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.left = '0px';
  // stats.domElement.style.top = '0px';
  // document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  var color = {
    color: [255., 255., 5.], // RGB array
  };
  gui.addColor(color, 'color').name('Lights Color');
  var angle = {
    angle: 3.0
  };
  gui.add(angle, 'angle', 0, 5).step(1).name('Branches Angle');
  var sparseness = {
    sparseness: 0
  };
  gui.add(sparseness, 'sparseness', 0, 3).step(1).name('Sparseness');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();
  let obj0: string = readTextFile('./src/cylinder.obj');
  cylinder = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  cylinder.create();
  let obj1: string = readTextFile('./src/needle.obj');
  needle = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  needle.create();
  let obj2: string = readTextFile('./src/light.obj');
  light = new Mesh(obj2, vec3.fromValues(0, 0, 0));
  light.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  let lSystem: LSystem = new LSystem(cylinder, needle, light);
  lSystem.lSystemParse(angle.angle, sparseness.sparseness);

  const camera = new Camera(vec3.fromValues(0, 0, 20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.7, 0.7, 1, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  function tick() {
    if (angle.angle != prevAngle) {
      prevAngle = angle.angle;
      lSystem = new LSystem(cylinder, needle, light);
      lSystem.lSystemParse(angle.angle, sparseness.sparseness);
    }
    if (sparseness.sparseness != prevBranchSparse) {
      prevBranchSparse = sparseness.sparseness;
      lSystem = new LSystem(cylinder, needle, light);
      lSystem.lSystemParse(angle.angle, sparseness.sparseness);
    }
    camera.update();
    // stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad], color.color);
    renderer.render(camera, instancedShader, [
      cylinder, needle, light
    ],
    color.color);
    // stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();

function readTextFile(file: string): string
{
  var text = "";
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function ()
  {
    if(rawFile.readyState === 4)
    {
      if(rawFile.status === 200 || rawFile.status == 0)
      {
        var allText = rawFile.responseText;
        text = allText;
      }
    }
  }
  rawFile.send(null);
  return text;
}