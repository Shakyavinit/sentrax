import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Search, Route, Archive, ChevronRight, Play, MapPin, ShieldAlert } from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { alertsApi } from '../api/alerts';
import { camerasApi } from '../api/cameras';
import { vehiclesApi } from '../api/vehicles';
import { assetUrl, DEMO_MODE } from '../utils/demo';
import { SAMPLE_PLATES } from '../api/demoClient';
import { PageHeader } from '../components/layout/PageHeader';
import { formatTimestamp } from '../utils/format';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate(), [plate, setPlate] = useState('');
  const { data: stats } = useQuery({queryKey:['summary'], queryFn: analyticsApi.getSummary});
  const { data: alerts = [] } = useQuery({queryKey:['alerts','overview'], queryFn: () => alertsApi.list({status:'active'})});
  const { data: cameras = [] } = useQuery({queryKey:['cameras'], queryFn:camerasApi.list});
  const { data: search } = useQuery({queryKey:['overview-sightings'], queryFn:() => vehiclesApi.search({limit:5})});
  const [error, setError] = useState('');
  const metrics = [
    { label: 'Available cameras', value: stats ? `${stats.cameras_online} / ${stats.cameras_total}` : '—', note: DEMO_MODE ? 'Sample camera registry' : 'Registered camera status', image:'cctv_camera_3d.png', to:'/cameras' },
    { label: 'Unique vehicles', value: stats?.vehicles_detected_today ?? '—', note: DEMO_MODE ? 'In the sample dataset' : 'Detected today', image:'police_car_3d.png', to:'/investigation' },
    { label: 'Plate sightings', value: stats?.plates_scanned ?? '—', note: 'Search across camera locations', image:'plate_scanner_3d.png', to:'/investigation' },
    { label: 'Awaiting review', value: alerts.length, note: 'Human verification required', image:'alert_beacon_3d.png', to:'/alerts' },
  ];
  return <div className="overview">
    <PageHeader title="Investigation overview" description="One workspace. Every sighting connected." actions={<Link className="primary-action" to="/investigation"><Search size={16}/> Start investigation</Link>} />
    <div className="metric-grid">{metrics.map(m => <Link key={m.label} to={m.to} className="metric-card">
      <div><p>{m.label}</p><strong>{m.value}</strong><small>{m.note}</small></div>
      <img className="color-reveal" src={assetUrl('images/'+m.image)} alt="" width="84" height="84"/><ArrowUpRight className="metric-arrow" size={15}/>
    </Link>)}</div>
    <div className="overview-primary">
      <section className="work-panel search-panel">
        <div className="eyebrow"><Search size={15}/> VEHICLE INTELLIGENCE</div>
        <h2>Follow the vehicle.<br/><span>Connect the evidence.</span></h2>
        <p>Search a registration plate to review sightings, reconstruct its journey and preserve the relevant records.</p>
        <form className="plate-search" onSubmit={e => {e.preventDefault(); const value=plate.replace(/\s/g,'').toUpperCase(); if (!value) {setError('Enter a registration plate or choose a sample below.'); return;} navigate('/investigation?plate='+encodeURIComponent(value));}}>
          <Search size={20}/><input aria-label="Vehicle registration plate" placeholder="Enter plate, e.g. GJ01AB1234" value={plate} onChange={e=>{setPlate(e.target.value.toUpperCase());setError('');}}/><button type="submit" aria-label="Search vehicle"><ArrowUpRight size={22}/></button>
        </form>
        {error && <p role="alert">{error}</p>}
        {DEMO_MODE && <div className="sample-plates"><span>TRY A SAMPLE</span>{SAMPLE_PLATES.slice(0,2).map(p=><Link key={p} to={'/investigation?plate='+p}>{p}<ChevronRight size={13}/></Link>)}</div>}
        <div className="investigation-steps"><span><Search size={16}/> Find sightings</span><span><Route size={16}/> Trace route</span><span><Archive size={16}/> Preserve evidence</span></div>
      </section>
      <section className="work-panel review-panel">
        <div className="panel-heading"><h2><ShieldAlert size={18}/> Review queue</h2><Link to="/alerts">View all <ArrowUpRight size={14}/></Link></div>
        <p className="panel-description">Potential matches, not confirmed identities.</p>
        {alerts.length ? alerts.slice(0,3).map(a=><Link className="review-row" key={a.id} to="/alerts"><span className="review-indicator"/><div><strong>{a.plate_text}</strong><small>{a.camera_name}</small></div><span className="review-tag">{(100*(a.plate_conf||0)).toFixed(0)}%{DEMO_MODE ? ' sample' : ''}</span><ChevronRight size={16}/></Link>) : <div className="empty-state">No alerts awaiting review.</div>}
        <div className="review-footnote">Always verify the source frame before acting on a match.</div>
      </section>
    </div>
    <section className="work-panel">
      <div className="panel-heading"><div><h2>Camera network</h2><p className="panel-description">{DEMO_MODE ? 'Prerecorded samples · Not live surveillance' : 'Open a camera to inspect its feed'}</p></div><Link to="/live">Open monitor <ArrowUpRight size={15}/></Link></div>
      <div className="camera-preview-grid">{cameras.slice(0,3).map((camera,i)=><Link className="camera-preview" to={'/live?camera='+encodeURIComponent(camera.id)} key={camera.id}>
        <div className="camera-preview-image"><img src={assetUrl(`images/feed_cam0${i+1}.jpg`)} alt={`Illustrative footage for ${camera.name}`} loading="lazy"/><span className="camera-sample-label">{DEMO_MODE ? 'SAMPLE FOOTAGE' : camera.status.toUpperCase()}</span><span className="camera-play"><Play size={19}/></span></div>
        <div className="camera-caption"><div><strong>{camera.name}</strong><small><MapPin size={12}/>{camera.location_name}</small></div><ArrowUpRight size={18}/></div>
      </Link>)}</div>
      {!cameras.length && <div className="empty-state">No camera data available. Check the registry or backend connection.</div>}
    </section>
    <section className="work-panel">
      <div className="panel-heading"><h2>Recent sightings</h2><Link to="/investigation">Explore records <ArrowUpRight size={15}/></Link></div>
      <div className="table-scroll"><table className="overview-table"><thead><tr><th>Registration</th><th>Camera location</th><th>Timestamp</th><th>Plate confidence</th><th>Action</th></tr></thead><tbody>
        {(search?.items||[]).map(s=><tr key={s.id}><td className="plate-cell">{s.plate_text}</td><td>{s.camera_name}</td><td>{formatTimestamp(s.frame_ts)}</td><td>{((s.plate_conf||0)*100).toFixed(0)}%{(s.plate_conf||0)<0.8 && <span className="review-tag"> Review</span>}</td><td><Link to={'/journey?plate='+s.plate_text}>Trace journey <ArrowUpRight size={14}/></Link></td></tr>)}
      </tbody></table></div>
      <div className="panel-footer">{DEMO_MODE ? 'Sample snapshot · 13 September 2026 · Confidence values are illustrative' : 'Confidence is a model score, not proof of identity.'}</div>
    </section>
  </div>;
};
