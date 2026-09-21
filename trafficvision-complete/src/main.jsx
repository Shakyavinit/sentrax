import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const cameras = [
  {id:1,name:"Downtown Junction",city:"New York",country:"USA",type:"Traffic",lat:40.7128,lng:-74.0060,status:"LIVE",vehicles:42,source:"Demo DOT",image:"images/feed_cam01.jpg"},
  {id:2,name:"Golden Gate Approach",city:"San Francisco",country:"USA",type:"Traffic",lat:37.8199,lng:-122.4783,status:"LIVE",vehicles:27,source:"Demo DOT",image:"images/feed_cam02.jpg"},
  {id:3,name:"Central London",city:"London",country:"UK",type:"Street",lat:51.5074,lng:-0.1278,status:"LIVE",vehicles:35,source:"Demo Transport",image:"images/feed_cam03.jpg"},
  {id:4,name:"Shibuya Crossing",city:"Tokyo",country:"Japan",type:"Street",lat:35.6595,lng:139.7005,status:"LIVE",vehicles:71,source:"Demo Network",image:"images/feed_cam04.jpg"},
  {id:5,name:"Marina Bay",city:"Singapore",country:"Singapore",type:"Scenic",lat:1.2868,lng:103.8545,status:"LIVE",vehicles:19,source:"Demo Network",image:"images/feed_cam05.jpg"},
  {id:6,name:"Ahmedabad Ring Road",city:"Ahmedabad",country:"India",type:"Traffic",lat:23.0225,lng:72.5714,status:"LIVE",vehicles:54,source:"Demo India",image:"images/cam_mg_road_thumb.jpg"},
  {id:7,name:"Gandhinagar Highway",city:"Gandhinagar",country:"India",type:"Traffic",lat:23.2156,lng:72.6369,status:"LIVE",vehicles:31,source:"Demo India",image:"images/cam_sg_highway_thumb.jpg"},
  {id:8,name:"Sydney Harbour",city:"Sydney",country:"Australia",type:"Scenic",lat:-33.8523,lng:151.2108,status:"LIVE",vehicles:12,source:"Demo Network",image:"images/feed_cam06.jpg"},
  {id:9,name:"Toronto Downtown",city:"Toronto",country:"Canada",type:"Street",lat:43.6532,lng:-79.3832,status:"LIVE",vehicles:29,source:"Demo Canada",image:"images/feed_cam07.jpg"},
  {id:10,name:"Dubai Downtown",city:"Dubai",country:"UAE",type:"Traffic",lat:25.2048,lng:55.2708,status:"LIVE",vehicles:38,source:"Demo Network",image:"images/feed_cam08.jpg"},
  {id:11,name:"Berlin Ring",city:"Berlin",country:"Germany",type:"Traffic",lat:52.52,lng:13.405,status:"LIVE",vehicles:23,source:"Demo Europe",image:"images/feed_cam09.jpg"},
  {id:12,name:"Rio Coast",city:"Rio de Janeiro",country:"Brazil",type:"Beach",lat:-22.9068,lng:-43.1729,status:"LIVE",vehicles:8,source:"Demo Brazil",image:"images/cctv_smpte_placeholder.svg"}
];

const markerIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 42S4 28.7 4 17C4 9.82 9.82 4 17 4s13 5.82 13 13c0 11.7-13 25-13 25Z" fill="#4ade80" stroke="#051009" stroke-width="3"/>
      <circle cx="17" cy="17" r="6" fill="#051009"/><circle cx="17" cy="17" r="3" fill="#4ade80"/>
    </svg>`),
  iconSize:[34,44], iconAnchor:[17,42], popupAnchor:[0,-40]
});

function FlyTo({camera}) {
  const map = useMap();
  useEffect(() => { if(camera) map.flyTo([camera.lat,camera.lng], 11, {duration:.8}); }, [camera,map]);
  return null;
}

function BootScreen({onDone}) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 2100);
    const t2 = setTimeout(() => onDone(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`tv-boot-screen ${fade ? "fade-out" : ""}`} onClick={() => { setFade(true); setTimeout(onDone, 300); }}>
      <div className="tv-scanlines"></div>
      <div className="tv-radar-wrapper">
        <div className="tv-radar-ring ring-1"></div>
        <div className="tv-radar-ring ring-2"></div>
        <div className="tv-radar-ring ring-3"></div>
        <div className="tv-radar-sweep"></div>
        <div className="tv-radar-blip blip-1"></div>
        <div className="tv-radar-blip blip-2"></div>
        <div className="tv-radar-blip blip-3"></div>
        <div className="tv-radar-center"></div>
      </div>
      <div className="tv-boot-brand">
        <span className="tv-brand-dot"></span> TRAFFIC<span>VISION</span><small>.LIVE</small>
      </div>
      <div className="tv-boot-tag">GLOBAL CAMERA INTELLIGENCE MATRIX</div>
      <div className="tv-boot-terminal">
        <div className="tv-log">> INITIALIZING EDGE NEURAL NODES... <span className="tv-ok">[OK]</span></div>
        <div className="tv-log">> CONNECTING TO 155,000+ LIVE MUNICIPAL CAMERAS... <span className="tv-ok">[OK]</span></div>
        <div className="tv-log">> SYNCING YOLO OPTICAL FLOW & SPEED SENSORS... <span className="tv-ok">[OK]</span></div>
        <div className="tv-log">> TRAFFICVISION SENSORS ONLINE // ACCESS GRANTED</div>
      </div>
      <div className="tv-boot-progress-wrap">
        <div className="tv-boot-progress-bar"></div>
      </div>
      <div className="tv-boot-progress-text">
        <span>RADAR CALIBRATION COMPLETE</span>
        <strong>100%</strong>
      </div>
    </div>
  );
}

function Header({page,setPage,onSearch,onReplayBoot}) {
  const [q,setQ]=useState("");
  return <header className="topbar">
    <div className="brand" onClick={()=>setPage("home")}><span className="brand-dot"></span>TRAFFIC<span>VISION</span><small>.LIVE</small></div>
    <nav>
      {["home","map","routes","camguessr","premium"].map(x=>
        <button key={x} className={page===x?"nav active":"nav"} onClick={()=>setPage(x)}>{x==="home"?"DASHBOARD":x.toUpperCase()}</button>
      )}
      <a href="/" className="nav" style={{textDecoration:"none",color:"#94a3b8"}}>📖 511 GUIDE</a>
    </nav>
    <div className="header-search">
      <span>⌕</span><input value={q} onChange={e=>{setQ(e.target.value);onSearch(e.target.value)}} placeholder="Search cameras..." />
    </div>
    <button className="replay-btn" onClick={onReplayBoot} title="Replay starting boot animation">⚡ REPLAY BOOT</button>
    <button className="icon-btn" title="Toggle theme">◐</button>
  </header>
}

function Stat({n,label}) { return <div className="stat"><strong>{n}</strong><span>{label}</span></div> }

function CameraCard({c,onOpen,fav,onFav}) {
  return <article className="camera-card">
    <div className="thumb" style={{backgroundImage:`url(${c.image})`}}>
      <div className="live-pill"><i></i>{c.status}</div>
      <button className="heart" onClick={()=>onFav(c.id)}>{fav?"♥":"♡"}</button>
      <div className="camera-type">{c.type}</div>
    </div>
    <div className="card-body">
      <div className="cam-title"><div><h3>{c.name}</h3><p>{c.city}, {c.country}</p></div><span className="cam-count">{c.vehicles} <small>det.</small></span></div>
      <div className="meter"><span style={{width:`${Math.min(92,c.vehicles+12)}%`}}></span></div>
      <div className="card-foot"><span>{c.source}</span><button onClick={()=>onOpen(c)}>WATCH →</button></div>
    </div>
  </article>
}

function Home({filtered,onOpen,favorites,onFav,setPage}) {
  return <main className="page">
    <section className="hero">
      <div className="eyebrow">● GLOBAL CAMERA NETWORK / ONLINE</div>
      <h1>LIVE CAMERA<br/><em>INTELLIGENCE.</em></h1>
      <p>Search, monitor and analyze live public camera feeds from around the world. A fast interface for traffic, streets, weather and places.</p>
      <div className="hero-actions"><button className="primary" onClick={()=>setPage("map")}>EXPLORE LIVE MAP ↗</button><button className="secondary" onClick={()=>setPage("routes")}>BUILD A ROUTE</button></div>
    </section>
    <section className="stats"><Stat n="155K+" label="CAMERAS INDEXED"/><Stat n="700+" label="SOURCE NETWORKS"/><Stat n="130+" label="COUNTRIES"/><Stat n="24/7" label="MONITORING"/></section>
    <section className="section-head"><div><span>// LIVE FEEDS</span><h2>ACTIVE CAMERAS</h2></div><button onClick={()=>setPage("map")}>VIEW ALL →</button></section>
    <div className="grid">{filtered.slice(0,8).map(c=><CameraCard key={c.id} c={c} onOpen={onOpen} fav={favorites.includes(c.id)} onFav={onFav}/>)}</div>
  </main>
}

function MapPage({cameras,selected,setSelected,onOpen}) {
  const [filter,setFilter]=useState("All");
  const list=filter==="All"?cameras:cameras.filter(c=>c.type===filter);
  return <main className="map-page">
    <div className="map-toolbar"><div><span className="eyebrow">// WORLD NETWORK</span><h2>LIVE CAMERA MAP</h2></div><div className="filters">{["All","Traffic","Street","Scenic","Beach"].map(x=><button className={filter===x?"selected":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
    <div className="map-layout">
      <aside className="map-sidebar"><div className="side-head"><b>{list.length} CAMERAS</b><span>LIVE</span></div>{list.map(c=><button className={`side-cam ${selected?.id===c.id?"chosen":""}`} key={c.id} onClick={()=>setSelected(c)}><span className="side-status"></span><div><strong>{c.name}</strong><small>{c.city} · {c.vehicles} detections</small></div></button>)}</aside>
      <div className="map-wrap"><MapContainer center={[23,20]} zoom={2} minZoom={2} maxZoom={16} scrollWheelZoom className="map"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{list.map(c=><Marker key={c.id} position={[c.lat,c.lng]} icon={markerIcon} eventHandlers={{click:()=>setSelected(c)}}><Popup><b>{c.name}</b><br/>{c.city}, {c.country}<br/><button className="popup-btn" onClick={()=>onOpen(c)}>Open camera</button></Popup></Marker>)}<FlyTo camera={selected}/></MapContainer></div>
    </div>
  </main>
}

function WatchModal({camera,onClose}) {
  if(!camera)return null;
  return <div className="modal-backdrop" onClick={onClose}><div className="watch-modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="live-pill"><i></i> LIVE</span><h2>{camera.name}</h2><p>{camera.city}, {camera.country} · {camera.source}</p></div><button onClick={onClose}>✕</button></div>
    <div className="video-stage" style={{backgroundImage:`url(${camera.image})`}}><div className="scan"></div><div className="ai-box box-a">CAR <b>0.96</b></div><div className="ai-box box-b">CAR <b>0.91</b></div><div className="ai-hud">AI VISION · VEHICLE DETECTION<br/><strong>{camera.vehicles}</strong> OBJECTS DETECTED</div><div className="play">▶</div></div>
    <div className="modal-stats"><Stat n={camera.vehicles} label="VEHICLES"/><Stat n="98.4%" label="STREAM HEALTH"/><Stat n="LIVE" label="SOURCE STATUS"/></div>
    <p className="disclaimer">Demo mode: this project uses representative public imagery. Replace the demo image URLs with feeds you are licensed or authorized to display.</p>
  </div></div>
}

function RoutesPage({cameras,onOpen}) {
  const [from,setFrom]=useState(""); const [to,setTo]=useState(""); const [built,setBuilt]=useState(false);
  return <main className="page narrow"><div className="eyebrow">// ROUTE INTELLIGENCE</div><h1 className="subhero">BUILD YOUR<br/><em>CAMERA ROUTE.</em></h1>
    <div className="route-panel"><label>START LOCATION<input value={from} onChange={e=>setFrom(e.target.value)} placeholder="e.g. Gandhinagar"/></label><div className="route-line"></div><label>DESTINATION<input value={to} onChange={e=>setTo(e.target.value)} placeholder="e.g. Ahmedabad"/></label><button className="primary full" onClick={()=>setBuilt(true)}>FIND CAMERAS ALONG ROUTE</button></div>
    {built && <section className="route-results"><div className="section-head"><div><span>// ROUTE RESULT</span><h2>{from||"START"} → {to||"DESTINATION"}</h2></div></div><div className="grid">{cameras.slice(0,4).map(c=><CameraCard key={c.id} c={c} onOpen={onOpen} fav={false} onFav={()=>{}}/>)}</div></section>}
  </main>
}

function CamGuessr({cameras}) {
  const [round,setRound]=useState(1); const [score,setScore]=useState(0); const [answer,setAnswer]=useState(null); const current=cameras[(round-1)%cameras.length];
  const guess=()=>{setScore(s=>s+Math.floor(Math.random()*4001)+1000);setAnswer(current.city)};
  const next=()=>{setAnswer(null);setRound(r=>r===5?1:r+1)};
  return <main className="page narrow"><div className="eyebrow">// CAMGUESSR / LIVE CAMERA GAME</div><h1 className="subhero">WHERE IN THE<br/><em>WORLD?</em></h1><div className="game"><div className="game-image" style={{backgroundImage:`url(${current.image})`}}><span>ROUND {round}/5</span></div><div className="game-controls"><div><small>SCORE</small><strong>{score.toLocaleString()}</strong></div>{answer?<><p className="answer">LOCATION: {answer}</p><button className="primary" onClick={next}>NEXT ROUND →</button></>:<button className="primary" onClick={guess}>LOCK MY GUESS</button>}</div></div></main>
}

function Premium() {
  const [pass,setPass]=useState(""); const [unlocked,setUnlocked]=useState(false);
  return <main className="page narrow premium-page"><div className="eyebrow">// PREMIUM ACCESS</div><h1 className="subhero">CAMERA<br/><em>LAB.</em></h1><div className="premium-card"><div className="premium-icon">◆</div><h2>PRO DEMO EXPERIENCE</h2><p>Preview the advanced demo-video workflow, AI overlay presentation and operator dashboard.</p>{!unlocked?<div className="lock"><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Demo password"/><button className="primary" onClick={()=>pass==="trafficvision"&&setUnlocked(true)}>UNLOCK DEMO</button><small>Demo password: <code>trafficvision</code></small></div>:<div className="demo-video"><div className="play">▶</div><div><b>PREMIUM DEMO VIDEO</b><small>AI traffic analysis walkthrough</small></div></div>}</div></main>
}

function App() {
  const [booting, setBooting] = useState(true);
  const [page,setPage]=useState("home"),[query,setQuery]=useState(""),[selected,setSelected]=useState(null),[modal,setModal]=useState(null),[favorites,setFavorites]=useState([]);
  const filtered=useMemo(()=>cameras.filter(c=>[c.name,c.city,c.country,c.type].join(" ").toLowerCase().includes(query.toLowerCase())),[query]);
  const fav=id=>setFavorites(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id]);
  const open=c=>{setSelected(c);setModal(c)};
  return <>
    {booting && <BootScreen onDone={()=>setBooting(false)} />}
    <Header page={page} setPage={setPage} onSearch={setQuery} onReplayBoot={()=>setBooting(true)}/>
    {page==="home"&&<Home filtered={filtered} onOpen={open} favorites={favorites} onFav={fav} setPage={setPage}/>}
    {page==="map"&&<MapPage cameras={filtered} selected={selected} setSelected={setSelected} onOpen={open}/>}
    {page==="routes"&&<RoutesPage cameras={filtered} onOpen={open}/>}
    {page==="camguessr"&&<CamGuessr cameras={cameras}/>}
    {page==="premium"&&<Premium/>}
    <footer><span>TRAFFICVISION.LIVE</span><span>PUBLIC CAMERA INTELLIGENCE PLATFORM</span><span>© 2026</span></footer>
    <WatchModal camera={modal} onClose={()=>setModal(null)}/>
  </>
}
createRoot(document.getElementById("root")).render(<App/>);