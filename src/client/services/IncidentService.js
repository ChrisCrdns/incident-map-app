export class IncidentService {
  constructor() {
    this.baseUrl = '/api/now/table';
    // Active incident states: 1=New, 2=In Progress, 3=On Hold
    this.activeStates = ['1', '2', '3'];
  }

  /**
   * Fetch active incidents with location information
   */
  async listActiveIncidents(filters = {}) {
    try {
      const params = new URLSearchParams({
        sysparm_display_value: 'all',
        sysparm_fields: 'sys_id,number,short_description,state,priority,assigned_to,location,opened_at,caller_id,urgency',
        sysparm_limit: '2000'
      });

      // Build query for active incidents
      let query = `stateIN${this.activeStates.join(',')}`;
      
      // Add location filter
      if (filters.location) {
        query += `^location=${filters.location}`;
      }
      
      // Add text search filter
      if (filters.search) {
        query += `^short_descriptionLIKE${filters.search}^ORnumberLIKE${filters.search}`;
      }
      
      // Add priority filter
      if (filters.priority && filters.priority.length > 0) {
        query += `^priorityIN${filters.priority.join(',')}`;
      }
      
      // Add state filter (within active states)
      if (filters.state && filters.state.length > 0) {
        const activeStateFilter = filters.state.filter(s => this.activeStates.includes(s));
        if (activeStateFilter.length > 0) {
          query += `^stateIN${activeStateFilter.join(',')}`;
        }
      }
      
      // Add date filter
      if (filters.dateFrom) {
        query += `^opened_at>=${filters.dateFrom}`;
      }
      if (filters.dateTo) {
        query += `^opened_at<=${filters.dateTo}`;
      }

      params.set('sysparm_query', query);

      const response = await fetch(`${this.baseUrl}/incident?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-UserToken': window.g_ck
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching active incidents:', error);
      throw error;
    }
  }

  /**
   * Fetch locations that have active incidents
   */
  async listActiveIncidentLocations() {
    try {
      // First get unique location IDs from active incidents
      const incidents = await this.listActiveIncidents();
      const locationIds = [...new Set(incidents.map(incident => {
        const locationSysId = typeof incident.location === 'object' ? 
          incident.location.value : incident.location;
        return locationSysId;
      }).filter(Boolean))];

      if (locationIds.length === 0) {
        return [];
      }

      const params = new URLSearchParams({
        sysparm_display_value: 'all',
        sysparm_fields: 'sys_id,name,latitude,longitude,city,state,country,full_name',
        sysparm_query: `sys_idIN${locationIds.join(',')}^latitude!=NULL^longitude!=NULL`,
        sysparm_limit: '1000',
        sysparm_order_by: 'name'
      });

      const response = await fetch(`${this.baseUrl}/cmn_location?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-UserToken': window.g_ck
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching active incident locations:', error);
      throw error;
    }
  }

  /**
   * Get available filter options
   */
  async getFilterOptions() {
    try {
      const incidents = await this.listActiveIncidents();
      
      // Extract unique priorities and states
      const priorities = [...new Set(incidents.map(incident => {
        const priority = typeof incident.priority === 'object' ? 
          incident.priority.value : incident.priority;
        return priority;
      }).filter(Boolean))].sort();

      const states = [...new Set(incidents.map(incident => {
        const state = typeof incident.state === 'object' ? 
          incident.state.value : incident.state;
        return state;
      }).filter(Boolean))].sort();

      return { priorities, states };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return { priorities: [], states: [] };
    }
  }

  /**
   * Get incidents within map bounds
   */
  filterIncidentsByMapBounds(incidents, bounds) {
    if (!bounds || !bounds.getNorthEast || !bounds.getSouthWest) {
      return incidents;
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    return incidents.filter(incident => {
      const locationSysId = typeof incident.location === 'object' ? 
        incident.location.value : incident.location;
      
      // This would need location coordinates - we'll implement this with the locations data
      return true; // For now, return all incidents
    });
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority) {
    const priorityValue = typeof priority === 'object' ? priority.value : priority;
    const labels = {
      '1': 'Critical',
      '2': 'High', 
      '3': 'Moderate',
      '4': 'Low',
      '5': 'Planning'
    };
    return labels[String(priorityValue)] || 'Unknown';
  }

  /**
   * Get state label
   */
  getStateLabel(state) {
    const stateValue = typeof state === 'object' ? state.value : state;
    const labels = {
      '1': 'New',
      '2': 'In Progress', 
      '3': 'On Hold'
    };
    return labels[String(stateValue)] || 'Unknown';
  }
}