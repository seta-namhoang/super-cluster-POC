const queryString = require('query-string');

const mapController =(req,res,next) =>{
  console.log("mapController",req.query)
  const {bbox,zoom} = req.query
  console.time('start_getting_cluster')
  const mapIndex = req.app.get('mapIndex')
  console.log('mapindex', mapIndex);
  const newBbox = bbox.map((item)=>parseFloat(item))
  const cluster = mapIndex.getClusters(newBbox,Math.floor(parseFloat(zoom)))
  console.log('cluster', cluster);
  const featureCollection ={
    "type": "FeatureCollection",
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
    features: cluster
  }
  console.time('start_getting_cluster')
  res.send(featureCollection)
}

module.exports ={
  mapController
}
