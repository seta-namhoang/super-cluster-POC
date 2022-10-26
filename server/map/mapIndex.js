const Supercluster = require("supercluster");

console.time('read')

const point1000k = require('./dataset/1000000p.json')

console.timeEnd('read')
const initMap =  () =>{
  console.time('index')
  const mapIndex = new Supercluster({
    radius: 50,
    maxZoom: 18,
    nodeSize: 64
  })

  mapIndex.load(point1000k.features)
  console.timeEnd('index')
  return mapIndex
}
module.exports ={
  initMap,
}
