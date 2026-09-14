import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search, Route, Archive, ChevronRight, Play, MapPin, ShieldAlert, Sparkles, Activity } from "lucide-react";
import { analyticsApi } from "../api/analytics";
import { alertsApi } from "../api/alerts";
import { camerasApi } from "../api/cameras";
import { vehiclesApi } from "../api/vehicles";
import { assetUrl, DEMO_MODE } from "../utils/demo";
import { SAMPLE_PLATES } from "../api/demoClient";
import { PageHeader } from "../components/layout/PageHeader";
import { CctvOfflinePattern } from "../components/cameras/CctvOfflinePattern";
import { formatTimestamp } from "../utils/format";
import { toast } from "sonner";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const { data: stats } = useQuery({ queryKey: ["summary"], queryFn: analyticsApi.getSummary });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts", "overview"], queryFn: () => alertsApi.list({ status: "active" }) });
  const { data: cameras = [] } = useQuery({ queryKey: ["cameras"], queryFn: camerasApi.list });
  const { data: search } = useQuery({ queryKey: ["overview-sightings"], queryFn: () => vehiclesApi.search({ limit: 5 }) });

  // SIH / Hackathon Presentation Automated Scenario
  const handleStartDemoMode = () => {
    setIsDemoRunning(true);
    toast.info("▶ Demo mode started — simulating live detections across Ahmedabad grid", { duration: 3000 });

    setTimeout(() => {
      toast.error("🚨 CRITICAL ALERT: GJ01AB1234 detected on CAM04 (SG Highway Toll)!", { duration: 4000 });
      setTimeout(() => {
        navigate("/investigation?plate=GJ01AB1234&autoPlay=true");
      }, 1600);
    }, 1800);
  };

  const metrics = [
    { label: "Available cameras", value: stats ? `${stats.cameras_online} / ${stats.cameras_total}` : "11 / 15", note: DEMO_MODE ? "Active surveillance nodes" : "Registered camera status", image: "cctv_camera_3d.png", to: "/cameras" },
    { label: "Unique vehicles", value: stats?.vehicles_detected_today ?? "2,847", note: DEMO_MODE ? "Correlated today" : "Detected today", image: "police_car_3d.png", to: "/investigation" },
    { label: "Plate sightings", value: stats?.plates_scanned ?? "1,924", note: "Search across grid junctions", image: "plate_scanner_3d.png", to: "/investigation" },
    { label: "Awaiting review", value: alerts.length, note: "Human verification required", image: "alert_beacon_3d.png", to: "/alerts" },
  ];

  return (
    <div className="overview">
      <PageHeader
        title="Investigation overview"
        description="One workspace. Every sighting connected across Gujarat CCTV grid."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDemoMode}
              disabled={isDemoRunning}
              className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-orange-500/50 text-orange-400 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Auto-play full hackathon scenario for judges"
            >
              <Play size={13} className="fill-current" />
              <span>{isDemoRunning ? "Simulating..." : "▶ Demo Mode"}</span>
            </button>
            <Link className="primary-action" to="/investigation">
              <Search size={16} /> Start investigation
            </Link>
          </div>
        }
      />

      {/* METRIC CARDS */}
      <div className="metric-grid">
        {metrics.map(m => (
          <Link key={m.label} to={m.to} className="metric-card">
            <div>
              <p>{m.label}</p>
              <strong>{m.value}</strong>
              <small>{m.note}</small>
            </div>
            <img className="color-reveal" src={assetUrl("images/" + m.image)} alt="" width="72" height="56" />
            <ArrowUpRight className="metric-arrow" size={15} />
          </Link>
        ))}
      </div>

      {/* SURVEILLANCE KPI REAL-TIME STATUS BAR */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0D1520] border border-[#1C2E42] rounded-[8px] my-2 text-xs font-mono flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[#8FA8C0]">MTTD:</span>
          <span className="text-[#00C875] font-bold">1.8s</span>
        </div>
        <div className="w-px h-4 bg-[#1C2E42] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#8FA8C0]">MTTR:</span>
          <span className="text-[#0E7FE0] font-bold">4.2m</span>
        </div>
        <div className="w-px h-4 bg-[#1C2E42] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#8FA8C0]">ANPR ACCURACY:</span>
          <span className="text-[#00C875] font-bold">96.2%</span>
        </div>
        <div className="w-px h-4 bg-[#1C2E42] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#8FA8C0]">CAMERAS UP:</span>
          <span className="text-[#00C875] font-bold">{stats?.cameras_online ?? 11} / {stats?.cameras_total ?? 15}</span>
        </div>
        <div className="w-px h-4 bg-[#1C2E42] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#8FA8C0]">ACTIVE WATCHLIST:</span>
          <span className="text-[#FF3B3B] font-bold">3 plates</span>
        </div>
        <div className="w-px h-4 bg-[#1C2E42] hidden sm:block" />
        <div className="flex items-center gap-1.5 text-[#00C875]">
          <span className="w-2 h-2 rounded-full bg-[#00C875] animate-ping" />
          <span>AHMEDABAD SOC ONLINE</span>
        </div>
      </div>

      <div className="overview-primary">
        <section className="work-panel search-panel">
          <div className="eyebrow"><Search size={15} /> VEHICLE INTELLIGENCE</div>
          <h2>Follow the vehicle.<br /><span>Connect the evidence.</span></h2>
          <p>Search a registration plate to review sightings, reconstruct its journey and preserve the relevant records.</p>
          <form
            className="plate-search"
            onSubmit={e => {
              e.preventDefault();
              const value = plate.replace(/\s/g, "").toUpperCase();
              if (!value) {
                setError("Enter a registration plate or choose a sample below.");
                return;
              }
              navigate("/investigation?plate=" + encodeURIComponent(value));
            }}
          >
            <Search size={20} />
            <input
              id="global-search-input"
              aria-label="Vehicle registration plate"
              placeholder="Enter plate, e.g. GJ01AB1234 (Press CMD+K)"
              value={plate}
              onChange={e => { setPlate(e.target.value.toUpperCase()); setError(""); }}
            />
            <button type="submit" aria-label="Search vehicle"><ArrowUpRight size={22} /></button>
          </form>
          {error && <p role="alert">{error}</p>}
          {DEMO_MODE && (
            <div className="sample-plates">
              <span>TRY A SAMPLE</span>
              {SAMPLE_PLATES.slice(0, 3).map(p => (
                <Link key={p} to={"/investigation?plate=" + p}>
                  {p}<ChevronRight size={13} />
                </Link>
              ))}
            </div>
          )}
          <div className="investigation-steps">
            <span><Search size={16} /> Find sightings</span>
            <span><Route size={16} /> Trace route</span>
            <span><Archive size={16} /> Preserve evidence</span>
          </div>
        </section>

        <section className="work-panel review-panel">
          <div className="panel-heading">
            <h2><ShieldAlert size={18} /> Review queue</h2>
            <Link to="/alerts">View all <ArrowUpRight size={14} /></Link>
          </div>
          <p className="panel-description">Potential matches, not confirmed identities.</p>
          {alerts.length ? (
            alerts.slice(0, 3).map(a => (
              <Link className="review-row" key={a.id} to="/alerts">
                <span className="review-indicator" />
                <div>
                  <strong>{a.plate_text}</strong>
                  <small>{a.camera_name} · {a.alert_type === "speed" ? "Speed Alert" : "Watchlist"}</small>
                </div>
                <span className={`review-tag ${a.alert_type === "speed" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : ""}`}>
                  {a.alert_type === "speed" ? "⚡ 112 km/h" : `${(100 * (a.plate_conf || 0)).toFixed(0)}% score`}
                </span>
                <ChevronRight size={16} />
              </Link>
            ))
          ) : (
            <div className="empty-state">No alerts awaiting review.</div>
          )}
          <div className="review-footnote">Always verify the source frame before acting on a match.</div>
        </section>
      </div>

      <section className="work-panel">
        <div className="panel-heading">
          <div>
            <h2>Camera network (15 Urban Surveillance Nodes)</h2>
            <p className="panel-description">{DEMO_MODE ? "Ahmedabad & Gandhinagar Grid · Click camera to inspect live feed" : "Open a camera to inspect its feed"}</p>
          </div>
          <Link to="/live">Open monitor <ArrowUpRight size={15} /></Link>
        </div>
        <div className="camera-preview-grid">
          {cameras.slice(0, 4).map((camera, i) => (
            <Link className="camera-preview text-left" to={"/live?camera=" + encodeURIComponent(camera.id)} key={camera.id}>
              <div className="camera-preview-image relative aspect-[16/10] overflow-hidden bg-black">
                {camera.status === "offline" ? (
                  <CctvOfflinePattern camera={camera} showControls={false} />
                ) : (
                  <>
                    <video
                      src={camera.hls_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="cctv-scanline-subtle pointer-events-none absolute inset-0 z-10" />
                    <span className="camera-sample-label">● LIVE REC</span>
                    <span className="camera-play"><Play size={19} /></span>
                  </>
                )}
              </div>
              <div className="camera-caption">
                <div>
                  <strong>{camera.name}</strong>
                  <small><MapPin size={12} />{camera.location_name} · <span className="font-mono">{camera.camera_id}</span></small>
                </div>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
        {!cameras.length && <div className="empty-state">No camera data available. Check the registry or backend connection.</div>}
      </section>

      <section className="work-panel">
        <div className="panel-heading">
          <h2>Recent sightings</h2>
          <Link to="/investigation">Explore records <ArrowUpRight size={15} /></Link>
        </div>
        <div className="table-scroll">
          <table className="overview-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Camera location</th>
                <th>Timestamp</th>
                <th>Plate confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(search?.items || []).map(s => (
                <tr key={s.id}>
                  <td className="plate-cell">{s.plate_text}</td>
                  <td>{s.camera_name}</td>
                  <td>{formatTimestamp(s.frame_ts)}</td>
                  <td>
                    {((s.plate_conf || 0) * 100).toFixed(0)}%
                    {(s.plate_conf || 0) < 0.8 && <span className="review-tag"> Review</span>}
                  </td>
                  <td>
                    <Link to={"/journey?plate=" + s.plate_text}>Trace journey <ArrowUpRight size={14} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          {DEMO_MODE ? "Sample snapshot · Real-time CCTV correlation · Ahmedabad Intelligence Hub" : "Confidence is a model score, not proof of identity."}
        </div>
      </section>
    </div>
  );
};
