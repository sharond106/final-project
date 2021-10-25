import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;
  bufRotateCol0: WebGLBuffer;
  bufRotateCol1: WebGLBuffer;
  bufRotateCol2: WebGLBuffer;
  bufRotateCol3: WebGLBuffer;
  bufScale: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  uvGenerated: boolean = false;
  rotationGenerated0: boolean = false;
  rotationGenerated1: boolean = false;
  rotationGenerated2: boolean = false;
  rotationGenerated3: boolean = false;
  scaleGenerated: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufUV);
    gl.deleteBuffer(this.bufRotateCol0);
    gl.deleteBuffer(this.bufRotateCol1);
    gl.deleteBuffer(this.bufRotateCol2);
    gl.deleteBuffer(this.bufRotateCol3);
    gl.deleteBuffer(this.bufScale);
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norGenerated = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateGenerated = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }

  generateRotationCol0() {
    this.rotationGenerated0 = true;
    this.bufRotateCol0 = gl.createBuffer();
  }

  generateRotationCol1() {
    this.rotationGenerated1 = true;
    this.bufRotateCol1 = gl.createBuffer();
  }

  generateRotationCol2() {
    this.rotationGenerated2 = true;
    this.bufRotateCol2 = gl.createBuffer();
  }

  generateRotationCol3() {
    this.rotationGenerated3 = true;
    this.bufRotateCol3 = gl.createBuffer();
  }

  generateScale() {
    this.scaleGenerated = true;
    this.bufScale = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindNor(): boolean {
    if (this.norGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindTranslate(): boolean {
    if (this.translateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateGenerated;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }

  bindRotationCol0(): boolean {
    if (this.rotationGenerated0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufRotateCol0);
    }
    return this.rotationGenerated0;
  }

  bindRotationCol1(): boolean {
    if (this.rotationGenerated1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufRotateCol1);
    }
    return this.rotationGenerated1;
  }

  bindRotationCol2(): boolean {
    if (this.rotationGenerated2) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufRotateCol2);
    }
    return this.rotationGenerated2;
  }

  bindRotationCol3(): boolean {
    if (this.rotationGenerated3) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufRotateCol3);
    }
    return this.rotationGenerated3;
  }

  bindScale(): boolean {
    if (this.scaleGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    }
    return this.scaleGenerated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
