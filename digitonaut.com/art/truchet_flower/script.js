var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext("webgl");

//Time step and time variable
var dt = 0.02;
var time = 0.0;

//************** Shader sources **************
var vertexSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

var fragmentSource = `
#define PI 3.14159265358979323846
precision highp float;

uniform float width;
uniform float height;
vec2 u_resolution = vec2(width, height);
uniform float u_time;

vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 rotateToCenter(vec2 _st){

    _st *= 2.0;
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;
    _st = fract(_st);

    if(index == 1.0){/*rotate acc to index*/
        _st = rotate2D(_st,-PI/2.0);/*90deg*/
    } else if(index == 2.0){
        _st = rotate2D(_st,PI/2.0);/*-90deg*/
    } else if(index == 3.0){
        _st = rotate2D(_st,PI*2.0);/*180deg*/
    } else if(index == 0.0) {
        _st = rotate2D(_st, PI);
    }
    return _st;
}

void main (void) {
  
  vec2 st = gl_FragCoord.xy/u_resolution.xy;/* normalized coords between 0.0 and 1.0 */
  float d = distance(st,vec2(.5, .5));/*distance to center*/
  float t = u_time/4.0;
  float tm = .5+.05*(sin(mod(t, PI*3.0)));/*time multiplier used to slow down sin/cos for colors*/
  t = mod(t, PI*20.0);
  
  //rotation
  st = rotateToCenter(st);/*tiles and rotates*/
  float dc = distance(st,vec2(.5, .5));/*distance to center of each cell*/  
  float rot = 3.0*PI+sin(mod(t,PI*20.0));
  float theta = atan(st.y,st.x);
  vec2 uv = vec2(.5)-st;
  uv = rotate2D(st, rot*theta+(1.0-d));  
  st *= uv;
  st = rotate2D(st, rot-dc+(1.0-d)); 
  
  //motion
  vec3 color3;
  for(float i = 1.0; i < 3.0; i+=1.0){  
    st.x += .1 * sin(PI*t+i*PI * st.y);
    st += .1*(d*(sin(t+d))*(abs(sin(t*d)*cos(2.*length(uv)))));
    color3[int(i)] = abs(cos(i+d+t)) * abs(sin(i*d+t));
    color3 += .5*sin(t*tm+d+theta);
  }

  //shapes
  float snake = step(st.y, st.x)  - step(st.y, st.x*.5);
  snake *= step(1.0-st.y, st.x)  - step(1.0-st.y, st.x*.5);
  vec2 bl = step(vec2(.02), st);/*bottom left*/
  vec2 tr = step(vec2(.02), 1.0-st);/*top right*/
  float box = bl.x * bl.y * tr.x * (tr.y);
  float tri = step((st.y), st.x);
  float tri2 = step(1.0-st.y, st.x);

  //colors
  vec3 color = (.2*theta+d*.2)+st.xyx+vec3(0,2,4);
  color = .5 + 0.5*(cos(color*(sin(t*tm))+d+t*.5));
  vec3 color2 = abs(color3+sin(t*tm));
  vec4 frag = 1.0-vec4(mix(color, color3, tri*snake)/(mix(color, color2, box)),1.0);
  gl_FragColor = frag+vec4((color*tri2*tri),1.0);

}`;

//************** Utility functions  **************//
/* setup utilities from: https://codepen.io/al-ro/details/paYYpm */
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform1f(widthHandle, window.innerWidth);
  gl.uniform1f(heightHandle, window.innerHeight);
}

//Compile shader and combine with source
function compileShader(shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}
//************** Create shaders **************
var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

//Create shader programs
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

//Set up rectangle covering entire canvas
var vertexData = new Float32Array([
  -1.0,
  1.0, // top left
  -1.0,
  -1.0, // bottom left
  1.0,
  1.0, // top right
  1.0,
  -1.0 // bottom right
]);

//Create vertex buffer
var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

// Layout of our data in the vertex buffer
var positionHandle = gl.getAttribLocation(program, "position");

gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(
  positionHandle,
  2, // position is a vec2 (2 values per component)
  gl.FLOAT, // each component is a float
  false, // don't normalize values
  2 * 4, // two 4 byte float components per vertex (32 bit float is 4 bytes)
  0 // how many bytes inside the buffer to start from
);

//Set uniform handles
var timeHandle = gl.getUniformLocation(program, "u_time");
var widthHandle = gl.getUniformLocation(program, "width");
var heightHandle = gl.getUniformLocation(program, "height");

gl.uniform1f(widthHandle, window.innerWidth);
gl.uniform1f(heightHandle, window.innerHeight);

function draw() {
  time += dt;
  gl.uniform1f(timeHandle, time);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(draw);
}

draw();