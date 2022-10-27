const Supercluster = require("supercluster");
const cron = require('node-cron');

console.time('read')
// using for low zoom level
const point1000k = require('./dataset/1000000p.json')
//using for mid zoom level
const hybridData = require('./dataset/10000p.json')


console.timeEnd('read')
const initMap = () =>{
  console.time('index')
  const mapIndex = new Supercluster({
    radius: 50,
    maxZoom: 18,
    nodeSize: 64
  })

  mapIndex.load(point1000k.features)
  global.mapIndex = mapIndex


  //Init hybrid ap index
  console.time('init index hybrid') 
  const initHybridMapIndex = new Supercluster({
    radius: 50,
    maxZoom: 18,
    nodeSize: 64
  })
  initHybridMapIndex.load(hybridData.features)
  console.timeEnd('init index hybrid')
  global.hybridMapIndex = initHybridMapIndex

  //run every 1 minute
  cron.schedule('* * * * *',()=>{
    console.log('cron')
    console.time('index hybrid')
    const hybridMapIndex = new Supercluster({
      radius: 50,
      maxZoom: 18,
      nodeSize: 64
    })
    hybridMapIndex.load(hybridData.features)
    console.timeEnd('index hybrid')
    global.hybridMapIndex = hybridMapIndex
  })
  
  console.timeEnd('index')


}
module.exports ={
  initMap,
}
