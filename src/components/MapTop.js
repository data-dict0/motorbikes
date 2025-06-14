import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const [playback, setPlayback] = useState('Pause');

  const mapContainerRef = useRef();
  const mapRef = useRef(null);
  const animationRef = useRef(null);
  const resetTimeRef = useRef(false);
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);

  const geojsonRef = useRef({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0]]
        }
      }
    ]
  });
  const speedFactor = 30;

  const animateLine = (timestamp) => {
    if (resetTimeRef.current) {
      startTimeRef.current = performance.now() - progressRef.current;
      resetTimeRef.current = false;
    } else {
      progressRef.current = timestamp - startTimeRef.current;
    }

    if (progressRef.current > speedFactor * 360) {
      startTimeRef.current = timestamp;
      geojsonRef.current.features[0].geometry.coordinates = [];
    } else {
      const x = progressRef.current / speedFactor;
      const y = Math.sin((x * Math.PI) / 90) * 40;
      geojsonRef.current.features[0].geometry.coordinates.push([x, y]);
      mapRef.current.getSource('line').setData(geojsonRef.current);
    }
    animationRef.current = requestAnimationFrame(animateLine);
  };

  const handleClick = () => {
    if (playback === 'Pause') {
      cancelAnimationFrame(animationRef.current);
      setPlayback('Play');
    } else {
      resetTimeRef.current = true;
      animateLine();
      setPlayback('Pause');
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = 'sk.eyJ1IjoicG1hZ3R1bGlzMDciLCJhIjoiY21iczlkZHZiMDAxYzJtb2k0d3R1MWQwNyJ9.KglOqvGFMEbFYeLusFtnSw';

    mapRef.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      center: [0, 0],
      zoom: 0.5,
      projection: 'equalEarth'
    });

    mapRef.current.on('load', () => {
      mapRef.current.addSource('line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [[0, 0]]
              }
            }
          ]
        }
      });

      mapRef.current.addLayer({
        id: 'line-animation',
        type: 'line',
        source: 'line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#ed6498',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      startTimeRef.current = performance.now();
      animateLine();

      document.addEventListener('visibilitychange', () => {
        resetTimeRef.current = true;
      });
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div id="map" ref={mapContainerRef} style={{ height: '100%' }}></div>
      <button
        id="pause"
        onClick={handleClick}
        style={{
          position: 'absolute',
          margin: '20px',
          top: '20px',
          backgroundColor: 'lightgrey',
          border: '1px solid gray',
          borderRadius: '3px',
          padding: '5px 10px'
        }}
      >
        {playback}
      </button>
    </div>
  );
};

export default MapboxExample;