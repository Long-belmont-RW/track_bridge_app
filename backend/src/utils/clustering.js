import { calculateHaversineDistance } from './geoMath.js';
import crypto from 'crypto';

export const performDBSCAN = (data, epsilon = 3, minPts = 4) => {
  const UNCLASSIFIED = 0;
  const NOISE = -1;
  const labels = new Array(data.length).fill(UNCLASSIFIED);
  let clusterId = 0;

  const getRegion = (pointIdx) => {
    const region = [];
    const pt1 = data[pointIdx];
    for (let i = 0; i < data.length; i++) {
      const pt2 = data[i];
      const dist = calculateHaversineDistance(
        pt1.recipient_lat, pt1.recipient_lng, 
        pt2.recipient_lat, pt2.recipient_lng
      );
      if (dist <= epsilon) {
        region.push(i);
      }
    }
    return region;
  };

  const expandCluster = (pointIdx, neighbors, currentClusterId) => {
    labels[pointIdx] = currentClusterId;
    let i = 0;
    while (i < neighbors.length) {
      const neighborIdx = neighbors[i];
      
      if (labels[neighborIdx] === UNCLASSIFIED) {
        labels[neighborIdx] = currentClusterId;
        const newNeighbors = getRegion(neighborIdx);
        if (newNeighbors.length >= minPts) {
          for (let j = 0; j < newNeighbors.length; j++) {
            if (!neighbors.includes(newNeighbors[j])) {
              neighbors.push(newNeighbors[j]);
            }
          }
        }
      } else if (labels[neighborIdx] === NOISE) {
        labels[neighborIdx] = currentClusterId;
      }
      i++;
    }
  };

  for (let i = 0; i < data.length; i++) {
    if (labels[i] !== UNCLASSIFIED) continue;
    const neighbors = getRegion(i);
    if (neighbors.length < minPts) {
      labels[i] = NOISE;
    } else {
      clusterId++;
      expandCluster(i, neighbors, clusterId);
    }
  }

  const clusters = {};
  const noise = [];

  for (let i = 0; i < data.length; i++) {
    const label = labels[i];
    if (label === NOISE) {
      noise.push(data[i]);
    } else {
      if (!clusters[label]) {
        clusters[label] = [];
      }
      clusters[label].push(data[i]);
    }
  }

  const routes = [];
  Object.keys(clusters).forEach(key => {
    routes.push({
      route_id: crypto.randomUUID(),
      is_outlier: false,
      deliveries: clusters[key]
    });
  });

  if (noise.length > 0) {
    routes.push({
      route_id: crypto.randomUUID(),
      is_outlier: true,
      deliveries: noise
    });
  }

  return routes;
};
