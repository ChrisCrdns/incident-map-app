import React, { useState, useEffect } from 'react';
import './FilterBar.css';

export default function FilterBar({ 
  onFiltersChange, 
  incidentService, 
  totalIncidents, 
  visibleIncidents,
  onMapAreaToggle,
  mapAreaFilterActive,
  onClearAll 
}) {
  const [searchText, setSearchText] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [availablePriorities, setAvailablePriorities] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load filter options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await incidentService.getFilterOptions();
        setAvailablePriorities(options.priorities);
        setAvailableStates(options.states);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    loadOptions();
  }, [incidentService]);

  // Notify parent of filter changes
  useEffect(() => {
    const filters = {
      search: searchText,
      priority: selectedPriorities,
      state: selectedStates,
      dateFrom: dateFrom,
      dateTo: dateTo
    };
    onFiltersChange(filters);
  }, [searchText, selectedPriorities, selectedStates, dateFrom, dateTo, onFiltersChange]);

  const handlePriorityToggle = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const handleStateToggle = (state) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleClearAll = () => {
    setSearchText('');
    setSelectedPriorities([]);
    setSelectedStates([]);
    setDateFrom('');
    setDateTo('');
    onClearAll();
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      '1': 'Critical',
      '2': 'High', 
      '3': 'Moderate',
      '4': 'Low',
      '5': 'Planning'
    };
    return labels[String(priority)] || 'Unknown';
  };

  const getStateLabel = (state) => {
    const labels = {
      '1': 'New',
      '2': 'In Progress', 
      '3': 'On Hold'
    };
    return labels[String(state)] || 'Unknown';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      '1': '#d32f2f', // Critical - Red
      '2': '#f57c00', // High - Orange  
      '3': '#fbc02d', // Moderate - Yellow
      '4': '#388e3c', // Low - Green
      '5': '#1976d2'  // Planning - Blue
    };
    return colors[String(priority)] || '#666';
  };

  const getStateColor = (state) => {
    const colors = {
      '1': '#1976d2', // New - Blue
      '2': '#f57c00', // In Progress - Orange
      '3': '#9c27b0'  // On Hold - Purple
    };
    return colors[String(state)] || '#666';
  };

  const activeFiltersCount = selectedPriorities.length + selectedStates.length + 
    (searchText ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="quick-filters">
          <div className="priority-filters">
            <span className="filter-label">Priority:</span>
            {availablePriorities.map(priority => (
              <button
                key={priority}
                className={`filter-chip priority ${selectedPriorities.includes(priority) ? 'active' : ''}`}
                style={{
                  '--chip-color': getPriorityColor(priority),
                  backgroundColor: selectedPriorities.includes(priority) ? getPriorityColor(priority) : 'transparent',
                  borderColor: getPriorityColor(priority),
                  color: selectedPriorities.includes(priority) ? 'white' : getPriorityColor(priority)
                }}
                onClick={() => handlePriorityToggle(priority)}
              >
                {getPriorityLabel(priority)}
              </button>
            ))}
          </div>

          <div className="state-filters">
            <span className="filter-label">State:</span>
            {availableStates.map(state => (
              <button
                key={state}
                className={`filter-chip state ${selectedStates.includes(state) ? 'active' : ''}`}
                style={{
                  '--chip-color': getStateColor(state),
                  backgroundColor: selectedStates.includes(state) ? getStateColor(state) : 'transparent',
                  borderColor: getStateColor(state),
                  color: selectedStates.includes(state) ? 'white' : getStateColor(state)
                }}
                onClick={() => handleStateToggle(state)}
              >
                {getStateLabel(state)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button 
            className={`toggle-btn ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced
          </button>
          
          <button 
            className={`toggle-btn map-area ${mapAreaFilterActive ? 'active' : ''}`}
            onClick={onMapAreaToggle}
            title="Only show incidents visible on map"
          >
            Map Area
          </button>

          {activeFiltersCount > 0 && (
            <button 
              className="clear-btn"
              onClick={handleClearAll}
            >
              Clear All ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="advanced-filters">
          <div className="date-filters">
            <div className="date-group">
              <label>From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-group">
              <label>To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        </div>
      )}

      <div className="results-info">
        <span className="result-count">
          Showing {visibleIncidents} of {totalIncidents} active incidents
          {mapAreaFilterActive && ' • In map view'}
        </span>
      </div>
    </div>
  );
}