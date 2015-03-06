const Mesh = require('bunny')
const Geometry = require('gl-geometry')
const mat4 = require('gl-mat4')
const wireframe = require('gl-wireframe')
const premult = require('premultiplied-rgba')

const Background = require('gl-vignette-background')
const rescale = require('rescale-vertices')
const boundingBox = require('vertices-bounding-box')
const quantize = require('quantize-vertices')

//some per-mesh properties
const lines = [20, 4, 0.5]
const levels = [1, 3, 4]
const colors = [ 
  [0.3, 0.3, 0.3, 1] 
].map(premult)

//create GL context
let gl = require('../base')(render, { 
  context: 'webgl',
  name: __dirname,
  description: 'rendering with `gl.LINES`'
})
let background = Background(gl, {
  color1: [1, 1, 1],
  color2: [0.8, 0.8, 0.8]
})

let projection = mat4.create()
let model = mat4.create()
let view = mat4.create()

mat4.translate(view, view, [0, -4, -15])
mat4.rotateY(model, model, 0.6)

let shader = require('gl-basic-shader')(gl)

//render mesh with edges
Mesh.cells = wireframe(Mesh.cells)

//create meshes
let meshes = levels.map(x => {
  //quantize the mesh & use edges instead of triangles
  let { positions, cells } = Mesh
  let bb = boundingBox(Mesh.positions)
  positions = quantize(Mesh.positions, x)
  positions = rescale(positions, bb)

  //create WebGL buffers
  let geometry = Geometry(gl)
  geometry.attr('position', positions)
  geometry.faces(cells)

  return { positions, cells, geometry }
})

function render(dt) {
  let width = gl.drawingBufferWidth
  let height = gl.drawingBufferHeight

  gl.clearColor(0,0,0,1)
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  gl.viewport(0, 0, width, height)
  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)

  background.draw()

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  mat4.perspective(projection, Math.PI/4, width / height, 0.01, 1000)
  mat4.rotateY(model, model, 0.8 * dt/1000)

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  shader.bind()
  shader.uniforms.projection = projection
  shader.uniforms.view = view
  shader.uniforms.model = model

  //draw meshes
  meshes.forEach((mesh, index, list) => {
    gl.lineWidth(lines[index % lines.length])
    shader.uniforms.tint = colors[index % colors.length]

    let geometry = mesh.geometry
    geometry.bind(shader)
    geometry.draw(gl.LINES)
    geometry.unbind()
  })
}