import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { IncidentService } from './services/IncidentService.js';
import FilterBar from './components/FilterBar.jsx';
import IncidentMap from './components/IncidentMap.jsx';
import IncidentList from './components/IncidentList.jsx';
import './app.css';

export default function App() {
  const svc = useMemo(() => new IncidentService(), []);
  
  // Data state
  const [allIncidents, setAllIncidents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    priority: [],
    state: [],
    dateFrom: '',
    dateTo: ''
  });
  const [mapAreaFilterActive, setMapAreaFilterActive] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  
  // Filtered incidents based on current filters
  const filteredIncidents = useMemo(() => {
    let filtered = allIncidents;
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(incident => {
        const number = typeof incident.number === 'object' ? 
          incident.number.display_value : incident.number;
        const shortDesc = typeof incident.short_description === 'object' ? 
          incident.short_description.display_value : incident.short_description;
        
        return (number && number.toLowerCase().includes(searchLower)) ||
               (shortDesc && shortDesc.toLowerCase().includes(searchLower));
      });
    }
    
    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(incident => {
        const priority = typeof incident.priority === 'object' ? 
          incident.priority.value : incident.priority;
        return filters.priority.includes(String(priority));
      });
    }
    
    // Apply state filter
    if (filters.state.length > 0) {
      filtered = filtered.filter(incident => {
        const state = typeof incident.state === 'object' ? 
          incident.state.value : incident.state;
        return filters.state.includes(String(state));
      });
    }
    
    return filtered;
  }, [allIncidents, filters]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading active incidents...');
        
        const incidentData = await svc.listActiveIncidents();
        console.log('Loaded incidents:', incidentData?.length || 0);
        
        const locationData = await svc.listActiveIncidentLocations();
        console.log('Loaded locations:', locationData?.length || 0);
        
        setAllIncidents(incidentData || []);
        setLocations(locationData || []);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load active incident data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [svc]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle map area filter toggle
  const handleMapAreaToggle = useCallback(() => {
    setMapAreaFilterActive(!mapAreaFilterActive);
  }, [mapAreaFilterActive]);

  // Handle map bounds change
  const handleMapBoundsChange = useCallback((bounds) => {
    setMapBounds(bounds);
  }, []);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    setFilters({
      search: '',
      priority: [],
      state: [],
      dateFrom: '',
      dateTo: ''
    });
    setMapAreaFilterActive(false);
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading active incidents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h2>Unable to load incidents</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Active Incident Map</h1>
        <p>Real-time view of incidents requiring attention</p>
      </header>

      <FilterBar
        onFiltersChange={handleFiltersChange}
        incidentService={svc}
        totalIncidents={filteredIncidents.length}
        visibleIncidents={filteredIncidents.length}
        onMapAreaToggle={handleMapAreaToggle}
        mapAreaFilterActive={mapAreaFilterActive}
        onClearAll={handleClearAll}
      />

      <div className="main-content">
        <div className="map-container">
          <IncidentMap
            incidents={filteredIncidents}
            locations={locations}
            onMapBoundsChange={handleMapBoundsChange}
            incidentService={svc}
          />
        </div>
        
        <div className="list-container">
          <IncidentList
            incidents={filteredIncidents}
            locations={locations}
            incidentService={svc}
          />
        </div>
      </div>
    </div>
  );
}