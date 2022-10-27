import React, { useRef, useEffect, useState, useCallback } from "react";
import { debounce, isEmpty } from "lodash";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "./Map.css";

import dataset from "./dataset.json";

let isSet = 1;

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

const Map = () => {
  const mapContainerRef = useRef(null);


  const debounceFunction = debounce((map) => {
    const bounds = map.getBounds();
    
    const zoomLevel = map.getZoom();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    if (zoomLevel < 8) {
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
    }
  }, 200);

  const fakeLiveData = useCallback((map) => {
    console.log('does it run');
    setInterval(() => {
      console.log("run fake live data");
      const bounds = map.getBounds();
      const boundsArr = bounds.toArray();
      const zoomLevel = map.getZoom();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      if (zoomLevel >= 8) {
        axios
          .get(`http://localhost:3000/liveData`, {
            params: {
              random: Math.random(),
              bbox: bbox,
              zoom: zoomLevel,
            },
          })
          .then((res) => {
            const { data = [] } = res;
            !isEmpty(data) && map.getSource("earthquakes").setData(data);
          });
      }
    }, 1000);
  });

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
        // cluster: true,
        // clusterMaxZoom: 14,
        // clusterRadius: 50,
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
            "#bada55",
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
          "circle-color": "#ac28f6",
          "circle-radius": 7,
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
    });
    fakeLiveData(map);

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Clean up on unmount
    
    return () => map.remove();
  }, []);


  return <div className="map-container" ref={mapContainerRef} />;
};

export default Map;
