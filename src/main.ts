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
let terrace: Mesh;
let floor: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let prevBuildingColor: number[] = [255., 255., 255.];
let prevWindowColor: number[] = [197., 211., 230.];
let prevTerraceColor: number[] = [197., 211., 230.];
let prevIterations: number = 4.0;
let prevWindowDensity: number = .5;

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
  var building_color = {
    color: [255., 255., 255.], // RGB array
  };
  gui.addColor(building_color, 'color').name('Building Color');
  var windows_color = {
    color: [34., 130., 179.], // RGB array
  };
  gui.addColor(windows_color, 'color').name('Windows Color');
  var terrace_color = {
    color: [197., 211., 230.], // RGB array
  };
  gui.addColor(terrace_color, 'color').name('Terrace Color');
  var iterations = {
    number: 4.0
  };
  var iterations = {
    number: 4.0
  };
  gui.add(iterations, 'number', 1, 8).step(1).name('Iterations');
  var window_density = {
    number: .5
  };
  gui.add(window_density, 'number', 0., 1.).name('Window Density');
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

  let obj0: string = readTextFile('roundbox1.obj');
  box1 = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  box1.create();
  let obj1: string = readTextFile('roundbox2.obj');
  box2 = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  box2.create();
  let obj2: string = readTextFile('roundbox3.obj');
  box3 = new Mesh(obj2, vec3.fromValues(0, 0, 0));
  box3.create();
  let obj3: string = readTextFile('roundbox1.obj');
  box4 = new Mesh(obj3, vec3.fromValues(0, 0, 0));
  box4.create();
  let obj4: string = readTextFile('window1.obj');
  window1 = new Mesh(obj4, vec3.fromValues(0, 0, 0));
  window1.create();
  let obj5: string = readTextFile('door.obj');
  door1 = new Mesh(obj5, vec3.fromValues(0, 0, 0));
  door1.create();
  let obj6: string = readTextFile('roundbox2.obj');
  box5 = new Mesh(obj6, vec3.fromValues(0, 0, 0));
  box5.create();
  let obj7: string = readTextFile('roundbox3.obj');
  box6 = new Mesh(obj7, vec3.fromValues(0, 0, 0));
  box6.create();
  let obj8: string = readTextFile('window2.obj');
  window2 = new Mesh(obj8, vec3.fromValues(0, 0, 0));
  window2.create();
  let obj9: string = readTextFile('terrace.obj');
  terrace = new Mesh(obj9, vec3.fromValues(0, 0, 0));
  terrace.create();
  let obj10: string = readTextFile('floor.obj');
  floor = new Mesh(obj10, vec3.fromValues(0, 0, 0));
  floor.create();


  screenQuad = new ScreenQuad();
  screenQuad.create();

  let shapeGrammar: Parser = new Parser(box1, box2, box3, box4, box5, box6, window1, door1, window2, terrace, floor,
                          building_color.color, windows_color.color, terrace_color.color, iterations.number, window_density.number);
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
    renderer.render(camera, flat, [screenQuad], building_color.color);
    renderer.render(camera, instancedShader, [
      box1, box2, box3, box4, box5, box6, window1, door1, window2, terrace, floor
    ],
    building_color.color);
    if (windows_color.color != prevWindowColor || building_color.color != prevBuildingColor || terrace_color.color != prevTerraceColor) {
      prevWindowColor = windows_color.color;
      prevBuildingColor =building_color.color;
      prevTerraceColor = terrace_color.color;
      shapeGrammar.setColorMap(prevBuildingColor, prevWindowColor, prevTerraceColor);
      shapeGrammar.draw();
    }
    if (iterations.number != prevIterations) {
      prevIterations = iterations.number;
      shapeGrammar = new Parser(box1, box2, box3, box4, box5, box6, window1, door1, window2, terrace, floor,
        building_color.color, windows_color.color, terrace_color.color, iterations.number, window_density.number);
      shapeGrammar.parse();
    }
    if (window_density.number != prevWindowDensity) {
      console.log("Tired " + window_density.number)
      prevWindowDensity = window_density.number;
      shapeGrammar.polyLibrary.windowDensity = window_density.number;
      shapeGrammar.removeWindows();
      shapeGrammar.subdivide();
      shapeGrammar.draw();
    }
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