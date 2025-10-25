import React from 'react';
import './LocationFilter.css';

export default function LocationFilter({ 
  locations, 
  selectedLocation, 
  onLocationChange, 
  onClear, 
  incidentCount 
}) {
  const handleLocationSelect = (e) => {
    const locationSysId = e.target.value;
    onLocationChange(locationSysId);
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

  const selectedLocationName = selectedLocation ? 
    locations.find(loc => {
      const sysId = typeof loc.sys_id === 'object' ? loc.sys_id.value : loc.sys_id;
      return sysId === selectedLocation;
    }) : null;

  return (
    <div className="location-filter">
      <div className="filter-controls">
        <label htmlFor="location-select" className="filter-label">
          Filter by Location:
        </label>
        <select 
          id="location-select"
          className="location-select" 
          value={selectedLocation} 
          onChange={handleLocationSelect}
        >
          <option value="">All Locations</option>
          {locations.map(location => {
            const sysId = typeof location.sys_id === 'object' ? location.sys_id.value : location.sys_id;
            return (
              <option key={sysId} value={sysId}>
                {getLocationDisplayName(location)}
              </option>
            );
          })}
        </select>
        
        {selectedLocation && (
          <button 
            className="clear-filter-btn" 
            onClick={onClear}
            title="Clear filter"
          >
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="filter-info">
        {selectedLocation ? (
          <span className="incident-count filtered">
            Showing {incidentCount} incident{incidentCount !== 1 ? 's' : ''} for{' '}
            <strong>{selectedLocationName ? getLocationDisplayName(selectedLocationName) : 'Selected Location'}</strong>
          </span>
        ) : (
          <span className="incident-count total">
            Showing all {incidentCount} incident{incidentCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}