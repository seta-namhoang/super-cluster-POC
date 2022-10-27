const pointsData = require("../map/dataset/1000000p.json");
const isInside = (bbox, point) => {
  if (
    point.x > bbox[0] &&
    point.x < bbox[2] &&
    point.y > bbox[1] &&
    point.y < bbox[3]
  ) {
    return true;
  }
  return false;
};

const mapController = (req, res, next) => {
  
  const { bbox, zoom } = req.query;
  console.time("start_getting_cluster");
  
  const mapIndex = global.mapIndex;
  const hybridMapIndex = global.hybridMapIndex;

  const newBbox = bbox.map((item) => parseFloat(item));
  const newZoom = parseFloat(zoom);
  console.log("newZoom", newZoom,'\n');
  let cluster = [];
  if (newZoom >= 8) {
  
    const features = pointsData.features;
    for(let i =0 ; i < features.length; i++) {
      if(isInside(newBbox, {
        x: features[i].geometry.coordinates[0],
        y: features[i].geometry.coordinates[1],
      })) {
        cluster.push(features[i])
      }
    }
  } else if (newZoom >= 3){
    cluster = hybridMapIndex.getClusters(newBbox, newZoom);
  }
  else {
    cluster = mapIndex.getClusters(newBbox, newZoom);
  }

  // console.log("cluster", cluster[0]);

  const featureCollection = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84",
      },
    },
    features: cluster,
  };
  console.timeEnd("start_getting_cluster");
  console.log('\n');
  res.send(featureCollection);
};

module.exports = {
  mapController,
};
