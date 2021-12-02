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
import Parser from './shapegrammar/Parser';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Square;
let box1: Mesh;
let box2: Mesh;
let box3: Mesh;
let box4: Mesh;
let box5: Mesh;
let box6: Mesh;
let window1: Mesh;
let window2: Mesh;
let door1: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let prevAngle: number = 3.0;
let prevBranchSparse: number = 0.0;

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
  // gui.addColor(color, 'color').name('Lights Color');
  // var angle = {
  //   angle: 3.0
  // };
  // gui.add(angle, 'angle', 0, 5).step(1).name('Branches Angle');
  // var sparseness = {
  //   sparseness: 0
  // };
  // gui.add(sparseness, 'sparseness', 0, 3).step(1).name('Sparseness');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  let obj0: string = readTextFile('./Meshes/box1.obj');
  box1 = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  box1.create();
  let obj1: string = readTextFile('./Meshes/box2.obj');
  box2 = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  box2.create();
  let obj2: string = readTextFile('./Meshes/box3.obj');
  box3 = new Mesh(obj2, vec3.fromValues(0, 0, 0));
  box3.create();
  let obj3: string = readTextFile('./Meshes/box1.obj');
  box4 = new Mesh(obj3, vec3.fromValues(0, 0, 0));
  box4.create();
  let obj4: string = readTextFile('./Meshes/window1.obj');
  window1 = new Mesh(obj4, vec3.fromValues(0, 0, 0));
  window1.create();
  let obj5: string = readTextFile('./Meshes/door.obj');
  door1 = new Mesh(obj5, vec3.fromValues(0, 0, 0));
  door1.create();
  let obj6: string = readTextFile('./Meshes/box2.obj');
  box5 = new Mesh(obj6, vec3.fromValues(0, 0, 0));
  box5.create();
  let obj7: string = readTextFile('./Meshes/box3.obj');
  box6 = new Mesh(obj7, vec3.fromValues(0, 0, 0));
  box6.create();
  let obj8: string = readTextFile('./Meshes/window2.obj');
  window2 = new Mesh(obj8, vec3.fromValues(0, 0, 0));
  window2.create();

  
  screenQuad = new ScreenQuad();
  screenQuad.create();

  let shapeGrammar: Parser = new Parser(box1, box2, box3, box4, box5, box6, window1, door1, window2);
  shapeGrammar.parse();

  const camera = new Camera(vec3.fromValues(0, 0, 10), vec3.fromValues(0, 0, 0));

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
    camera.update();
    // stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad], color.color);
    renderer.render(camera, instancedShader, [
      box1, box2, box3, box4, box5, box6, window1, door1, window2
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