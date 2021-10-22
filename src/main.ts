import {vec3} from 'gl-matrix';
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


/* l system for 2D (should I use a geometry for the pine needles?)
angle: 38
axiom: FFFFFFFV
rules:
V=[+++W][---W]Y[+++W][---W]Y[+++W][---W]Y[+++W][---W]V
W=+X[-WW]Z
X=-W[+XX]Z
Y=YZ
Z=[+FF][-FF]F

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
let screenQuad: ScreenQuad;
let time: number = 0.0;

function lSystemParse() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;

  let iterations: number = 3;
  let axiom: string = "F";
  let stack: Turtle[] = [];
  let turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0));
  
  let expansionRules: Map<string, ExpansionRule> = new Map();
  expansionRules.set('F', new ExpansionRule('F', 'F[+F][-F]'));

  let drawRules: Map<string, DrawingRule> = new Map();
  drawRules.set('F', new DrawingRule('F', square, turtle.moveUp.bind(turtle)));  
  drawRules.set('+', new DrawingRule('+', null, turtle.rotateAboutForward.bind(turtle, 45)));  
  drawRules.set('-', new DrawingRule('-', null, turtle.rotateAboutForward.bind(turtle, -45)));

  let newAxiom: string = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < axiom.length; j++) {
      let symbol: string = axiom.charAt(j);
      if (symbol == "[") {
        newAxiom += symbol;
      } else if (symbol == "]") {
        newAxiom += symbol;
      } else {
        let expansion = expansionRules.get(symbol); 
        if (expansion != null) {
          newAxiom += expansion.postcondition;
        } else {
          newAxiom += symbol;
        }
      }
    }
    axiom = newAxiom;
    newAxiom = "";
  }
  for (let j = 0; j < axiom.length; j++) {
    let symbol: string = axiom.charAt(j);
    if (symbol == "[") {
      let copy = new Turtle(vec3.clone(turtle.position), vec3.clone(turtle.forward), vec3.clone(turtle.right), vec3.clone(turtle.up));
      stack.push(copy);
      continue;
    } else if (symbol == "]") {
      let popped = stack.pop();
      turtle.position = popped.position;
      turtle.forward = popped.forward;
      turtle.right = popped.right;
      turtle.up = popped.up;
      continue;
    } 
    let drawRule: DrawingRule = drawRules.get(symbol);
    if (drawRule == null) {
      continue;
    }
    drawRule.drawRule();
    // create translate, rotate, scale vec4s for instance rendering of the cylinder
    // use turtle position as translate (change turtle to start at 000) 
    if (drawRule.mesh != null) {
      offsetsArray.push(turtle.position[0]);
      offsetsArray.push(turtle.position[1]);
      offsetsArray.push(turtle.position[2]);

      colorsArray.push(.8);
      colorsArray.push(.4);
      colorsArray.push(.4);
      colorsArray.push(1.0);
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"
}

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  let obj0: string = readTextFile('./src/cube.obj');
  // let obj0: string = readTextFile('./src/cylinder.obj');
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
      offsetsArray.push(i);
      offsetsArray.push(j);
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
  // cylinder.setInstanceVBOs(offsets, colors);
  // cylinder.setNumInstances(n * n);
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
  // lSystemParse();

  const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    // stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      cylinder
    ]);
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