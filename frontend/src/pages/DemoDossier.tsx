import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Route, Archive, Eye } from 'lucide-react';
import { vehiclesApi } from '../api/vehicles';
import { watchlistApi } from '../api/watchlist';
import { PageHeader } from '../components/layout/PageHeader';
import { formatTimestamp } from '../utils/format';

export const DemoDossier: React.FC = () => {
  const {plate = 'GJ01AB1234'} = useParams();
  const {data:journey,isLoading} = useQuery({queryKey:['journey',plate],queryFn:()=>vehiclesApi.getJourney(plate)});
  const {data:watchlist=[]} = useQuery({queryKey:['watchlist'],queryFn:()=>watchlistApi.list(true)});
  const watched=watchlist.some(w=>w.plate_text===plate);
  return <div className="overview"><PageHeader title={`Vehicle record · ${plate}`} description="Scenario sightings and investigator actions, grouped by registration plate."/>
    <div className="demo-notice">Fictional scenario. No owner identity, criminal history, VAHAN record, dispatch or legal certification is connected.</div>
    <section className="work-panel search-panel"><h2>{isLoading?'Loading record…':`${journey?.total_sightings || 0} sample sightings`}</h2><p>{watched?'This sample plate is on the demonstration watchlist. Review each match manually.':'This plate is not on the active demonstration watchlist.'}</p>
      <div className="page-actions mt-5"><Link className="primary-action" to={'/journey?plate='+encodeURIComponent(plate)}><Route size={16}/> Reconstruct journey</Link><Link className="primary-action" to={'/investigation?plate='+encodeURIComponent(plate)}><Archive size={16}/> Review and preserve</Link><Link className="primary-action" to="/watchlist"><Eye size={16}/> Manage watchlist</Link></div>
    </section><section className="work-panel"><div className="panel-heading"><h2>Recorded scenario observations</h2></div>{journey?.stops.map(s=><div className="review-row" key={s.sighting_id}><div><strong>{s.camera_name}</strong><small>{formatTimestamp(s.timestamp)}</small></div><span className="review-tag">{Math.round((s.plate_conf||0)*100)}% sample score</span></div>)}{!isLoading && !journey?.stops.length && <p className="empty-state">No matching sample sightings. No identity or route has been inferred.</p>}</section>
  </div>;
};
