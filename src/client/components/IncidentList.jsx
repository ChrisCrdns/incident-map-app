import React, { useMemo } from 'react';
import './IncidentList.css';

export default function IncidentList({ incidents, locations, incidentService, onIncidentSelect }) {
  const extractDisplayValue = (field) => {
    return typeof field === 'object' ? field.display_value : field;
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const dateValue = typeof dateString === 'object' ? dateString.display_value : dateString;
    try {
      const date = new Date(dateValue);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getLocationDisplayName = (incident) => {
    const locationSysId = typeof incident.location === 'object' ? 
      incident.location.value : incident.location;
    const location = locations.find(loc => {
      const sysId = typeof loc.sys_id === 'object' ? loc.sys_id.value : loc.sys_id;
      return sysId === locationSysId;
    });
    
    if (location) {
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
    }
    
    return extractDisplayValue(incident.location) || 'No Location';
  };

  // Sort incidents by priority (Critical first) then by opened date
  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      const aPriority = typeof a.priority === 'object' ? a.priority.value : a.priority;
      const bPriority = typeof b.priority === 'object' ? b.priority.value : b.priority;
      
      // Lower number = higher priority
      if (aPriority !== bPriority) {
        return parseInt(aPriority) - parseInt(bPriority);
      }
      
      // If same priority, sort by opened date (newest first)
      const aDate = typeof a.opened_at === 'object' ? a.opened_at.display_value : a.opened_at;
      const bDate = typeof b.opened_at === 'object' ? b.opened_at.display_value : b.opened_at;
      return new Date(bDate) - new Date(aDate);
    });
  }, [incidents]);

  if (!incidents || incidents.length === 0) {
    return (
      <div className="incident-list-container empty">
        <div className="empty-state">
          <h3>No active incidents found</h3>
          <p>All incidents are either resolved or don't match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="incident-list-container">
      <div className="list-header">
        <h2>Active Incidents</h2>
        <span className="incident-count">{incidents.length}</span>
      </div>

      <div className="incident-cards">
        {sortedIncidents.map(incident => {
          const number = extractDisplayValue(incident.number);
          const shortDesc = extractDisplayValue(incident.short_description);
          const assignedTo = extractDisplayValue(incident.assigned_to);
          const caller = extractDisplayValue(incident.caller_id);
          const openedAt = extractDisplayValue(incident.opened_at);
          const priority = incident.priority;
          const state = incident.state;
          const incidentUrl = getIncidentUrl(incident);

          return (
            <div key={number} className="incident-card">
              <div className="card-header">
                <div className="incident-info">
                  <div className="number-priority">
                    <a 
                      href={incidentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="incident-number"
                    >
                      {number}
                    </a>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(priority) }}
                    >
                      {incidentService.getPriorityLabel(priority)}
                    </span>
                  </div>
                  <div className="state-badge">
                    {incidentService.getStateLabel(state)}
                  </div>
                </div>
                <div className="opened-date">
                  {formatDate(openedAt)}
                </div>
              </div>

              <div className="card-content">
                <a 
                  href={incidentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="description-link"
                >
                  {shortDesc || 'No description available'}
                </a>
              </div>

              <div className="card-details">
                <div className="location-info">
                  📍 {getLocationDisplayName(incident)}
                </div>
                
                <div className="assignment-info">
                  {assignedTo ? (
                    <span>👤 {assignedTo}</span>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </div>

                {caller && (
                  <div className="caller-info">
                    📞 {caller}
                  </div>
                )}
              </div>

              <div className="card-actions">
                <a 
                  href={incidentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-btn"
                >
                  View Record
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}