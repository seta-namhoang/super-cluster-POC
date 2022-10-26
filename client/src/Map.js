import React, { useRef, useEffect, useState } from "react";
import { debounce } from "lodash";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "./Map.css";

import dataset from "./dataset.json";


let isSet = 1;

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

const Map = () => {
  const mapContainerRef = useRef(null);
  const [mapState, setMapState] = useState(null);

  const debounceFunction = debounce((map) => {
    const bounds = map.getBounds();
    const boundsArr = bounds.toArray();
    const zoomLevel = map.getZoom();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    axios
      .get(`http://localhost:3000/cluster`, {
        params: {
          bbox: bbox,
          zoom: zoomLevel,
        },
      })
      .then((res) => {
        const { data = [] } = res;

        map.getSource("earthquakes").setData(data);
        console.log("data", data);

        
      });
  }, 200);

  const handleClick = (map, e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("earthquakes")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  };

  useEffect(() => {
    console.time('render')
    // console.timeEnd('render')
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-87.65, 41.84],
      zoom: 2,
    });
    
    map.on("load", () => {
      console.time("load");
      // console.timeEnd("load");
      map.addSource("earthquakes", {
        type: "geojson",
        data: dataset,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "earthquakes",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "earthquakes",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "earthquakes",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });
        console.timeEnd("load");
    });
    
    map.on("move", (val) => {
      const result = debounceFunction(map);
    });
    map.on("click", "clusters", (e) => {
      handleClick(map, e);
    })

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Clean up on unmount
    setMapState(map);
    return () => map.remove();
  }, []);

  useEffect(() => {
    console.log("mapSatate", mapState);
  }, [mapState]);

  return <div className="map-container" ref={mapContainerRef} />;
};

export default Map;
