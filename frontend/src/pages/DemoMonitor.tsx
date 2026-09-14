import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Camera, Play, Search, LayoutGrid, List, MapPin, ArrowUpRight } from 'lucide-react';
import { camerasApi } from '../api/cameras';
import { vehiclesApi } from '../api/vehicles';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { assetUrl } from '../utils/demo';
import { formatTimestamp } from '../utils/format';

export const DemoMonitor: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(''), [status, setStatus] = useState('all'), [view, setView] = useState('grid');
  const {data: cameras = []} = useQuery({queryKey:['cameras'],queryFn:camerasApi.list});
  const selected = cameras.find(c=>c.id===(params.get('camera')||params.get('cam')) || c.camera_id===params.get('cam'));
  const {data: sightings} = useQuery({queryKey:['monitor-sightings',selected?.id],queryFn:()=>vehiclesApi.search({camera_id:selected!.id}),enabled:!!selected});
  const filtered = useMemo(()=>cameras.filter(c=>(status==='all'||c.status===status) && `${c.name} ${c.location_name} ${c.camera_id}`.toLowerCase().includes(query.toLowerCase())),[cameras,query,status]);
  return <div className="overview">
    <PageHeader title="Camera monitor" description="Review sample footage and explore the associated scenario sightings." actions={<Link to="/cameras" className="primary-action"><Camera size={16}/> Manage registry</Link>} />
    <div className="monitor-controls"><label className="global-search"><Search size={16}/><input aria-label="Filter cameras" placeholder="Find camera or location…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <select aria-label="Camera status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="online">Sample available</option><option value="offline">Offline</option><option value="unknown">Not connected</option></select>
      <span>{filtered.length} cameras</span><button className="icon-button" aria-label="Grid view" aria-pressed={view==='grid'} onClick={()=>setView('grid')}><LayoutGrid size={18}/></button><button className="icon-button" aria-label="List view" aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={18}/></button></div>
    <div className={`monitor-grid ${view==='list'?'is-list':''}`}>{filtered.map(c=> {
      const index=cameras.findIndex(camera=>camera.id===c.id);
      return <button key={c.id} className="camera-preview text-left" onClick={()=>setParams({camera:c.id})} aria-label={`Open ${c.name}`}>
        <div className="camera-preview-image">{index<9 && <img src={assetUrl(`images/feed_cam${String(index+1).padStart(2,'0')}.jpg`)} alt={`Illustrative ${c.name} footage`} loading="lazy"/>}<span className="camera-sample-label">{c.status==='online'?'PRERECORDED SAMPLE':c.status.toUpperCase()}</span><span className="camera-play"><Play size={20}/></span></div>
        <div className="camera-caption"><div><strong>{c.name}</strong><small><MapPin size={12}/>{c.location_name || 'Location not configured'} · {c.camera_id}</small></div><ArrowUpRight size={18}/></div>
      </button>;
    })}</div>
    {!filtered.length && <div className="work-panel empty-state">No cameras match these filters.</div>}
    <Modal isOpen={!!selected} onClose={()=>setParams({})} title={selected?.name || 'Camera'} maxWidth="4xl">
      {selected && <div className="space-y-4"><div className="demo-notice">Prerecorded illustrative footage. Sightings below belong to a fictional scenario and are not detections extracted from this video.</div>
        {selected.status==='online' && selected.hls_url ? <video key={selected.id} controls playsInline preload="metadata" className="w-full rounded-lg bg-black" src={selected.hls_url} aria-label="Sample camera playback"/> : <div className="empty-state">This camera has no sample playback available. No live stream is connected.</div>}
        <h3>Scenario sightings at this location</h3><div className="space-y-2">{sightings?.items.map(s=><Link className="review-row" key={s.id} to={'/investigation?plate='+s.plate_text}><strong>{s.plate_text}</strong><span>{formatTimestamp(s.frame_ts)}</span><ArrowUpRight size={16}/></Link>)}{!sightings?.items.length && <p className="panel-description">No sample sightings at this camera.</p>}</div>
      </div>}
    </Modal>
  </div>;
};
