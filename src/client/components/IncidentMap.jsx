import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import MarkerClusterGroup from 'react-leaflet-cluster';
import './IncidentMap.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map bounds controller
function MapBoundsController({ incidents, locations, onMapBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      if (onMapBoundsChange) {
        const bounds = map.getBounds();
        onMapBoundsChange(bounds);
      }
    };

    // Auto-fit to incidents
    if (incidents.length > 0) {
      const incidentLocations = incidents.map(incident => {
        const locationSysId = typeof incident.location === 'object' ? 
          incident.location.value : incident.location;
        const location = locations.find(loc => {
          const sysId = typeof loc.sys_id === 'object' ? loc.sys_id.value : loc.sys_id;
          return sysId === locationSysId;
        });
        
        if (location) {
          const lat = typeof location.latitude === 'object' ? 
            location.latitude.display_value : location.latitude;
          const lng = typeof location.longitude === 'object' ? 
            location.longitude.display_value : location.longitude;
          
          if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            return [parseFloat(lat), parseFloat(lng)];
          }
        }
        return null;
      }).filter(Boolean);

      if (incidentLocations.length === 1) {
        map.setView(incidentLocations[0], 12);
      } else if (incidentLocations.length > 1) {
        const bounds = L.latLngBounds(incidentLocations);
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map, incidents, locations, onMapBoundsChange]);

  return null;
}

export default function IncidentMap({ 
  incidents, 
  locations, 
  onIncidentSelect,
  onMapBoundsChange,
  incidentService
}) {
  // Create markers for incidents
  const incidentMarkers = useMemo(() => {
    return incidents.map(incident => {
      const locationSysId = typeof incident.location === 'object' ? 
        incident.location.value : incident.location;
      const location = locations.find(loc => {
        const sysId = typeof loc.sys_id === 'object' ? loc.sys_id.value : loc.sys_id;
        return sysId === locationSysId;
      });

      if (!location) return null;

      const lat = typeof location.latitude === 'object' ? 
        location.latitude.display_value : location.latitude;
      const lng = typeof location.longitude === 'object' ? 
        location.longitude.display_value : location.longitude;

      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return null;
      }

      return {
        ...incident,
        position: [parseFloat(lat), parseFloat(lng)],
        location: location
      };
    }).filter(Boolean);
  }, [incidents, locations]);

  const getIncidentUrl = (incident) => {
    const sysId = typeof incident.sys_id === 'object' ? incident.sys_id.value : incident.sys_id;
    return `/incident.do?sys_id=${sysId}`;
  };

  const getPriorityColor = (priority) => {
    const priorityValue = typeof priority === 'object' ? priority.value : priority;
    const colors = {
      '1': '#d32f2f', // Critical - Red
      '2': '#f57c00', // High - Orange  
      '3': '#fbc02d', // Moderate - Yellow
      '4': '#388e3c', // Low - Green
      '5': '#1976d2'  // Planning - Blue
    };
    return colors[String(priorityValue)] || '#666';
  };

  const getLocationDisplayName = (location) => {
    const name = typeof location.name === 'object' ? location.name.display_value : location.name;
    const city = typeof location.city === 'object' ? location.city.display_value : location.city;
    const state = typeof location.state === 'object' ? location.state.display_value : location.state;
    
    let displayName = name || '';
    if (city && state) {
      displayName += ` (${city}, ${state})`;
    } else if (city) {
      displayName += ` (${city})`;
    } else if (state) {
      displayName += ` (${state})`;
    }
    
    return displayName || 'Unknown Location';
  };

  // Group incidents by location for clustering effect
  const locationGroups = useMemo(() => {
    const groups = {};
    incidentMarkers.forEach(incident => {
      const locationKey = `${incident.position[0]},${incident.position[1]}`;
      if (!groups[locationKey]) {
        groups[locationKey] = {
          position: incident.position,
          location: incident.location,
          incidents: []
        };
      }
      groups[locationKey].incidents.push(incident);
    });
    return Object.values(groups);
  }, [incidentMarkers]);

  // Default center (approximate center of US)
  const defaultCenter = [39.8283, -98.5795];

  return (
    <div className="incident-map-container">
      <MapContainer
        center={defaultCenter}
        zoom={4}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapBoundsController 
          incidents={incidents}
          locations={locations}
          onMapBoundsChange={onMapBoundsChange}
        />

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          maxClusterRadius={40}
          polygonOptions={{
            fillColor: 'var(--brand)',
            color: 'var(--brand)',
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.2
          }}
        >
          {locationGroups.map((group, index) => {
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          maxClusterRadius={40}
          polygonOptions={{
            fillColor: 'var(--brand)',
            color: 'var(--brand)',
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.2
          }}
        >
          {locationGroups.map((group, index) => {
            const incidentCount = group.incidents.length;
            const radius = Math.max(8, Math.min(20, 8 + Math.log2(incidentCount) * 4));
            
            // Use the first incident's priority for color if single incident
            const primaryIncident = group.incidents[0];
            const color = incidentCount === 1 ? 
              getPriorityColor(primaryIncident.priority) : 'var(--brand)';

            return (
              <CircleMarker
                key={index}
                center={group.position}
                radius={radius}
                fillColor={color}
                color="white"
                weight={2}
                opacity={1}
                fillOpacity={0.8}
                className="leaflet-circle-marker"
                eventHandlers={{
                  mouseover: (e) => {
                    const layer = e.target;
                    layer.setRadius(radius * 1.2);
                  },
                  mouseout: (e) => {
                    const layer = e.target;
                    layer.setRadius(radius);
                  }
                }}
              >
              <Popup maxWidth={350} className="incident-popup">
                <div className="popup-content">
                  <div className="popup-location-header">
                    <h3>{getLocationDisplayName(group.location)}</h3>
                    <span className="incident-count-badge">
                      {incidentCount} incident{incidentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="incidents-list">
                    {group.incidents.slice(0, 5).map(incident => {
                      const number = typeof incident.number === 'object' ? 
                        incident.number.display_value : incident.number;
                      const shortDesc = typeof incident.short_description === 'object' ? 
                        incident.short_description.display_value : incident.short_description;
                      const priority = incident.priority;
                      const state = incident.state;
                      
                      return (
                        <div key={number} className="incident-item">
                          <div className="incident-header">
                            <a 
                              href={getIncidentUrl(incident)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="incident-number"
                            >
                              {number}
                            </a>
                            <span 
                              className="priority-indicator"
                              style={{ backgroundColor: getPriorityColor(priority) }}
                              title={incidentService?.getPriorityLabel ? 
                                incidentService.getPriorityLabel(priority) : 'Priority'}
                            ></span>
                          </div>
                          <div className="incident-description">
                            {shortDesc || 'No description'}
                          </div>
                          <div className="incident-state">
                            {incidentService?.getStateLabel ? 
                              incidentService.getStateLabel(state) : 'Unknown State'}
                          </div>
                        </div>
                      );
                    })}
                    
                    {incidentCount > 5 && (
                      <div className="more-incidents">
                        ... and {incidentCount - 5} more incident{incidentCount - 5 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {incidentMarkers.length === 0 && (
        <div className="empty-state-overlay">
          <div className="empty-state-content">
            <h3>No active incidents found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        </div>
      )}
    </div>
  );
}