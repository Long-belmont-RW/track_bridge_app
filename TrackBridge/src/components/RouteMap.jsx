import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCompanyRoutes } from '../services/deliveryService';

// Fix for default Leaflet icon missing issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A helper to generate a colored icon based on delivery status
const getStatusIcon = (status) => {
  let color = '#ef4444'; // Default red for pending
  if (status === 'delivered') color = '#22c55e'; // Green
  else if (status === 'assigned') color = '#3b82f6'; // Blue
  else if (status === 'in_transit' || status === 'out_for_delivery') color = '#eab308'; // Yellow
  
  const markerHtmlStyles = `
    background-color: ${color};
    width: 20px;
    height: 20px;
    display: block;
    left: -10px;
    top: -10px;
    position: relative;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  `;
  
  return L.divIcon({
    className: 'custom-pin',
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
    html: `<span style="${markerHtmlStyles}"></span>`
  });
};

const RouteMap = ({ deliveries: propDeliveries }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const locationIqKey = import.meta.env.VITE_LOCATIONIQ_KEY;

  useEffect(() => {
    if (propDeliveries) {
      setLoading(false);
      return;
    }

    const fetchRoutes = async () => {
      try {
        const data = await getCompanyRoutes();
        // Assuming data is an array of routes, each with a deliveries array
        setRoutes(data || []);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, [propDeliveries]);

  const abujaPosition = [9.0765, 7.3986];

  if (!locationIqKey) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-2">Missing LocationIQ API Key</h3>
        <p>Please add <code className="bg-red-100 px-2 py-1 rounded">VITE_LOCATIONIQ_KEY</code> to your <code className="bg-red-100 px-2 py-1 rounded">.env</code> file to render the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative z-0" style={{ borderRadius: "inherit" }}>
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <MapContainer 
        center={abujaPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${locationIqKey}`}
          attribution='&copy; <a href="https://locationiq.com">LocationIQ</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        
        {!loading && (propDeliveries ? [ { deliveries: propDeliveries } ] : routes).map((route) => {
          // ensure deliveries exist
          const deliveries = route.deliveries || [];
          
          return deliveries.map((delivery) => {
            // ensure valid coordinates
            if (!delivery.recipient_lat || !delivery.recipient_lng) return null;
            
            const statusIcon = getStatusIcon(delivery.status);
            
            return (
              <Marker 
                key={delivery.id} 
                position={[delivery.recipient_lat, delivery.recipient_lng]}
                icon={statusIcon}
              >
                <Popup className="custom-popup rounded-lg shadow-lg">
                  <div className="p-1 min-w-[150px]">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{delivery.recipient_name}</h4>
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">Tracking:</span> {delivery.tracking_number}
                    </div>
                    <div className="text-xs mt-2">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.status ? delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1) : 'Pending'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          });
        })}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
