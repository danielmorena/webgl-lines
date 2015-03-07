const createLine = require('./gl-line-3d')
const curve = require('adaptive-bezier-curve')
const mat4 = require('gl-mat4')
const arc = require('arc-to')

let gl = require('../base')(render, {
  name: __dirname,
  context: 'webgl',
  description: 'touch to animate paths'
})

let time = 0
let projection = mat4.create()
let identity = mat4.create()
let rotation = mat4.create()
let view = mat4.create()

mat4.translate(view, view, [0.0, 0.0, -3])
mat4.scale(rotation, rotation, [0.3, 0.3, 0.3])

let line = createLine(gl)

function render(dt) {
  time += dt/1000
  let width = gl.drawingBufferWidth
  let height = gl.drawingBufferHeight

  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)

  mat4.rotateY(rotation, rotation, 0.01)
  mat4.rotateX(rotation, rotation, 0.01)
  mat4.perspective(projection, Math.PI/4, width/height, 0, 1000)

  let path = arc(0, 0, 1, 0, Math.PI*2, false, 64)
  path.push(path[0])
  path = [ [-1, -1], [1, -1], [1, 1]]
  //reset others to identity  
  line.projection = projection
  line.model = rotation
  line.view = view
  
  line.color = [0.2, 0.2, 0.2]
  line.update(path)
  line.thickness = 0.25
  line.draw()
}