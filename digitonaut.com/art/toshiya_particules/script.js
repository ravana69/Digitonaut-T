/**
 * This code reference to these site.
 * YouTube : https://www.youtube.com/channel/UCDo7RTzizoOdPjY8A-xDR7g
 * Article : https://iquilezles.org/www/articles/palettes/palettes.htm
 * Site : https://al-ro.github.io/
 * Thank you so much.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

//const simplex = new SimplexNoise();

/**
 * Referenced | https://al-ro.github.io/
 * Thank you so much :)
 */
/*
const computeCurl = (x, y, z) => {
  const eps = 0.0001;
  const curl = new THREE.Vector3();
  
  //Find rate of change in YZ plane
  let n1 = simplex.noise3D(x, y + eps, z); 
  let n2 = simplex.noise3D(x, y - eps, z); 
  //Average to find approximate derivative
  let a = (n1 - n2)/(2 * eps);
  n1 = simplex.noise3D(x, y, z + eps); 
  n2 = simplex.noise3D(x, y, z - eps); 
  //Average to find approximate derivative
  let b = (n1 - n2)/(2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = simplex.noise3D(x, y, z + eps); 
  n2 = simplex.noise3D(x, y, z - eps); 
  a = (n1 - n2)/(2 * eps);
  n1 = simplex.noise3D(x + eps, y, z); 
  n2 = simplex.noise3D(x + eps, y, z); 
  b = (n1 - n2)/(2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = simplex.noise3D(x + eps, y, z); 
  n2 = simplex.noise3D(x - eps, y, z); 
  a = (n1 - n2)/(2 * eps);
  n1 = simplex.noise3D(x, y + eps, z); 
  n2 = simplex.noise3D(x, y - eps, z); 
  b = (n1 - n2)/(2 * eps);
  curl.z = a - b;

  return curl;
}
*/

/** vertex shader source */
const vertexShaderSource = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.14159265359;

void main(){
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

`;

/** fragment shader source */
const fragmentShaderSource = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

/**
 * Referenced | https://iquilezles.org/www/articles/palettes/palettes.htm
 * Thank you so much :)
 */
vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
  return a + b*cos( 6.28318*(c*t+d) );
}

/**
 * Referenced | https://thebookofshaders.com/10/?lan=jp
 * Thank you so much.
 */

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main () {
  float dash = sin(vUv.x * 50.0 - uTime * 5.0);
  if (dash < random(vPosition.xz)) discard;
  vec3 col =
    pal(
      distance(vPosition, vec3(0, 0, 0)) - uTime * 0.5,
      vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)
    );
  gl_FragColor = vec4(col, 1.0);
}

`;

/**
 * class Sketch
 */
class Sketch {
  constructor() {
    /** renderer */
    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
    document.getElementById('container').appendChild(this.renderer.domElement);
    
    //this.setupGui();
    this.init();
  }

  

  
  init() {
    /** time */
    this.time = new THREE.Clock(true);
    
    /** mouse */
    this.mouse = new THREE.Vector2();
    
    /** canvas size */
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    /** scene */
    this.scene = new THREE.Scene();
    
    /** setup and render */
    this.setupCanvas();
    this.setupCamera();
    this.setupLight();
    this.setupShape();
    this.setupEvents();
    
    this.render();
  }
  
  setupCanvas() {
    /** renderer */
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x082852, 1.0);
    
    /** style */
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.zIndex = '0';
    this.renderer.domElement.style.outline = 'none';
  }
  
  setupCamera() {
    const fov = 70;
    const fovRadian = (fov / 2) * (Math.PI / 180);
    
    this.dist = this.height / 2 / Math.tan(fovRadian);
    this.camera =
      new THREE.PerspectiveCamera(
        fov,
        this.width / this.height,
        0.001,
        1000
      );
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(new THREE.Vector3());
    this.scene.add(this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }
  
  setupLight() {
    /** directinal light */
    this.directionalLight = new THREE.DirectionalLight(0xffffff);
    this.scene.add(this.directionalLight);

    /** point light*/
    //this.pointLight = new THREE.PointLight(0xffffff, 1, this.dist);
    //this.pointLight.position.set(0, this.dist, 0);
    //this.scene.add(this.pointLight);
  }
  
  setupShape() {
    this.shapes = new Array();
    const s = new Shape(this, 0, 0, 0);
    this.shapes.push(s);
  }
  
  setupGui() {
    this.settings = {
      scale: 3,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'scale', 1, 10, 1).onChange(() => this.init());
  }
  
  render() {

    
    const time = this.time.getElapsedTime();
    
    /** shapes */
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i].update(time);
    }
    
    this.renderer.render(this.scene, this.camera);
    
    
    this.animationId = requestAnimationFrame(this.render.bind(this));
  }
  
  setupEvents() {
    window.addEventListener('resize', this.resize.bind(this), false);
    window.addEventListener('mousemove', this.mousemove.bind(this), false);
  }
  
  resize() {
    const id = this.animationId;
    
    cancelAnimationFrame(id);
    this.init();
  }
  
  mousemove(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
}

class Shape {
  constructor(sketch, x, y, z) {
    this.sketch = sketch;
    this.init(x, y, z);
  }
  
  init(x, y, z) {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {type: 'f', value: 0}
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    });
    
    
    for (let i = 0; i < 200; i++) {
      this.points = this.getPoints(360 * Math.random());
      const path = new THREE.CatmullRomCurve3(this.points);
      this.geometry = new THREE.TubeBufferGeometry(path, 6, 0.005, 8, false);
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.sketch.scene.add(this.mesh);
    }
  }
  
  getPoints(index) {
    const points = new Array();
    const rand = Math.random() / 10;
    const startVec = new THREE.Vector3();
    
    for (let i = 0; i < 100; i++) {
      const x = Math.sin(i * Math.PI / 180) * Math.cos(index * Math.PI / 180) / 100;
      const y = Math.sin(i * Math.PI / 180) * Math.sin(index * Math.PI / 180) / 100;
      const z = rand;
      const v = new THREE.Vector3(x, y, z);
      
      startVec.add(v);
      points.push(startVec.clone());
    }
    
    return points;
    /*
    const points = new Array();
    const rand = Math.random() / 10;
    let z = 0;
    for (let i = 0; i < 100; i++) {
      const x = Math.cos(index * Math.PI / 180) * (i / 100);
      const y = Math.sin(index * Math.PI / 180) * (i / 100);
      z += rand;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return points;
    */
  }
  
  update(time) {
    this.mesh.material.uniforms.uTime.value = time;
  }
}

window.addEventListener('load', () => {
  console.clear();

  const loading = document.getElementById('loading');
  loading.classList.add('loaded');

  new Sketch();
});