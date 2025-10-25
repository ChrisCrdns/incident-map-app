import '@servicenow/sdk/global';
import { UiPage } from '@servicenow/sdk/core';
import incidentMapPage from '../../client/index.html';

export const incident_location_map = UiPage({
  $id: Now.ID['incident-location-map'], 
  endpoint: 'x_820505_incidentp_incident_map.do',
  description: 'Interactive map displaying incidents grouped by location with filtering capabilities',
  category: 'general',
  html: incidentMapPage,
  direct: true
});