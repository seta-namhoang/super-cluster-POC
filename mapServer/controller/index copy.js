const getCacheInstance = require('../cache');
const queryString = require('query-string');
const { initMap } = require('../map/mapIndex');
const cacheInstance = getCacheInstance();

const mapController = (req, res, next) => {
  try {
    console.log("mapController", req.query)
    let mapIndex;
    if (cacheInstance.get('mapIndex')) {
      mapIndex = cacheInstance.get('mapIndex');
    } else {
      const mapIndex = initMap()
      cacheInstance.set('mapIndex', mapIndex);
    }
    console.log('map_index', mapIndex);
    const { bbox, zoom } = req.query
    console.time('start_getting_cluster')
    const newBbox = bbox.map((item) => parseFloat(item))
    const cluster = mapIndex.getClusters(newBbox, Math.floor(parseFloat(zoom)))
    const featureCollection = {
      "type": "FeatureCollection",
      "crs": {
        "type": "name",
        "properties": {
          "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      },
      features: cluster
    }
    console.timeEnd('start_getting_cluster')
    res.send(featureCollection)
  } catch(err) {
    res.send(err.toString())
  }
  
}

module.exports = {
  mapController
}
