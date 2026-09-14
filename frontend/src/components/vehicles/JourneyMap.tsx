import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { JourneyStop } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { formatTimestamp } from '../../utils/format';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import { Play, Pause, Maximize2, Layers, Compass, Zap } from 'lucide-react';

interface JourneyMapProps {
  stops: JourneyStop[];
  pathCoordinates: [number, number][];
  className?: string;
  selectedStopIndex?: number;
  onStopSelect?: (index: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  playbackSpeed?: number;
  onChangeSpeed?: (speed: number) => void;
}

// ─── MAP CONTROLLERS ────────────────────────────────────────────────────────
interface MapHandlerProps {
  stops: JourneyStop[];
  selectedStopIndex?: number;
  triggerFit?: number;
}

const MapHandler: React.FC<MapHandlerProps> = ({ stops, selectedStopIndex, triggerFit }) => {
  const map = useMap();
  const isInitialFit = useRef(false);

  // Invalidate size on mount, container resize, and window resize to prevent grey tiles or misalignment
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    const t = setTimeout(handleResize, 150);
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      try {
        ro = new ResizeObserver(() => {
          map.invalidateSize();
        });
        const container = map.getContainer();
        if (container) ro.observe(container);
      } catch (e) {
        // Fallback to window resize
      }
    }

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [map]);

  // Fit bounds when stops load or when triggerFit changes
  useEffect(() => {
    const validCoords = stops
      .filter((s) => s.latitude && s.longitude)
      .map((s) => [s.latitude!, s.longitude!] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 15,
        animate: isInitialFit.current,
      });
      isInitialFit.current = true;
    }
  }, [map, stops, triggerFit]);

  // Smooth fly to selected stop when clicked in timeline
  useEffect(() => {
    if (selectedStopIndex !== undefined && stops[selectedStopIndex]) {
      const s = stops[selectedStopIndex];
      if (s.latitude && s.longitude) {
        map.flyTo([s.latitude, s.longitude], Math.max(map.getZoom(), 14), {
          duration: 0.8,
          easeLinearity: 0.25,
        });
      }
    }
  }, [map, selectedStopIndex, stops]);

  return null;
};

// ─── CUSTOM TACTICAL MARKERS ────────────────────────────────────────────────
const createStopMarker = (
  num: number,
  isFirst: boolean,
  isLast: boolean,
  isSelected: boolean
) => {
  let bg = '#0E7FE0';
  let border = '#FFFFFF';
  let glow = 'rgba(14,127,224,0.4)';
  let size = 28;

  if (isFirst) {
    bg = '#00C875';
    border = '#A7F3D0';
    glow = 'rgba(0,200,117,0.5)';
  } else if (isLast) {
    bg = '#FF3B3B';
    border = '#FECACA';
    glow = 'rgba(255,59,59,0.5)';
  }

  if (isSelected) {
    size = 34;
    border = '#FFFFFF';
    glow = 'rgba(255,255,255,0.8)';
  }

  return L.divIcon({
    className: 'journey-custom-marker',
    html: `<div style="
      background: ${bg};
      color: #FFFFFF;
      border: ${isSelected ? '3px' : '2px'} solid ${border};
      box-shadow: 0 0 16px ${glow}, 0 2px 8px rgba(0,0,0,0.6);
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: ${size > 30 ? '12px' : '11px'};
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    ">
      ${num}
      ${
        isSelected
          ? `<span style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              border: 2px dashed ${bg};
              animation: spin 6s linear infinite;
            "></span>`
          : ''
      }
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Active moving marker during route playback (vehicle tracker)
const createActiveTrackerMarker = (plate: string) => {
  return L.divIcon({
    className: 'active-tracker-marker',
    html: `<div style="
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      background: #080C12;
      border: 2px solid #0E7FE0;
      box-shadow: 0 0 18px #0E7FE0, 0 0 32px rgba(14, 127, 224, 0.45);
      border-radius: 20px;
      padding: 4px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #E8EFF7;
      white-space: nowrap;
      cursor: pointer;
      z-index: 1000;
    ">
      <span style="font-size: 16px; filter: drop-shadow(0 0 6px #0E7FE0);">🚗</span>
      <span style="display: flex; align-items: center; gap: 5px;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #00C875; display: inline-block;"></span>
        ${plate}
      </span>
    </div>`,
    iconSize: [124, 36],
    iconAnchor: [62, 18],
  });
};

export const JourneyMap: React.FC<JourneyMapProps> = ({
  stops,
  pathCoordinates,
  className = 'h-full w-full',
  selectedStopIndex,
  onStopSelect,
  isPlaying = false,
  onTogglePlay,
  playbackSpeed = 1,
  onChangeSpeed,
}) => {
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [triggerFit, setTriggerFit] = useState(0);

  const center =
    stops.length > 0 && stops[0].latitude && stops[0].longitude
      ? ([stops[0].latitude, stops[0].longitude] as [number, number])
      : DEFAULT_MAP_CENTER;

  const currentStop =
    selectedStopIndex !== undefined && stops[selectedStopIndex]
      ? stops[selectedStopIndex]
      : stops[0];

  const layerUrls = {
    dark: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  return (
    <div
      className={`relative w-full h-full min-h-0 overflow-hidden rounded-[6px] border border-[#1C2E42] bg-[#080C12] ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* MAP CANVAS */}
      <MapContainer
        center={center}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', minHeight: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url={layerUrls[mapLayer]}
          subdomains={mapLayer === 'dark' ? 'abcd' : 'abc'}
          maxZoom={19}
        />

        <MapHandler
          stops={stops}
          selectedStopIndex={selectedStopIndex}
          triggerFit={triggerFit}
        />

        {/* Outer Glow Polyline */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: '#0E7FE0',
              weight: 8,
              opacity: 0.25,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Main Route Polyline with Tactical Dashes */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: '#1A9FFF',
              weight: 3.5,
              opacity: 0.9,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Sequential Stop Markers */}
        {stops.map((stop, idx) => {
          if (!stop.latitude || !stop.longitude) return null;
          const isSelected = selectedStopIndex === idx;
          const isFirst = idx === 0;
          const isLast = idx === stops.length - 1;

          return (
            <Marker
              key={stop.sighting_id || idx}
              position={[stop.latitude, stop.longitude]}
              icon={createStopMarker(idx + 1, isFirst, isLast, isSelected)}
              eventHandlers={{
                click: () => onStopSelect && onStopSelect(idx),
              }}
            >
              <Popup autoPan={false}>
                <div className="p-3 min-w-[260px] text-xs bg-[#0D1520] text-[#E8EFF7] rounded-[6px]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-bold ${
                          isFirst
                            ? 'bg-[#00C875] text-[#080C12]'
                            : isLast
                            ? 'bg-[#FF3B3B] text-white'
                            : 'bg-[#0E7FE0] text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-white">
                        STOP #{idx + 1}
                      </span>
                    </div>
                    <LicensePlate plate={stop.plate_text} size="sm" />
                  </div>

                  {/* Real Plate Crop Preview if Available */}
                  {stop.plate_crop_path && (
                    <div className="mb-2.5 rounded bg-[#080C12] p-1 border border-[#1C2E42] flex items-center justify-center">
                      <img
                        src={stop.plate_crop_path}
                        alt="Plate Crop"
                        className="max-h-16 object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="font-bold text-sm text-white mb-0.5">{stop.camera_name}</div>
                  <div className="text-[11px] text-[#8FA8C0] mb-2">{stop.location_name}</div>

                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#1C2E42] font-mono text-[10px]">
                    <div>
                      <span className="text-[#8FA8C0] block text-[9px]">INTERCEPTION</span>
                      <span className="text-[#00C875]">{formatTimestamp(stop.timestamp)}</span>
                    </div>
                    <div>
                      <span className="text-[#8FA8C0] block text-[9px]">CORRIDOR SPEED</span>
                      <span className="text-[#0E7FE0] font-bold">
                        {stop.speed_kmh ? `${stop.speed_kmh} km/h` : '48 km/h'}
                      </span>
                    </div>
                  </div>

                  {stop.dwell_time_mins && stop.dwell_time_mins > 0 ? (
                    <div className="mt-2 bg-[#121E2E] px-2 py-1 rounded border border-[#1C2E42] text-[10px] font-mono text-[#FF8C00] flex items-center justify-between">
                      <span>TRANSIT GAP</span>
                      <span className="font-bold">+{stop.dwell_time_mins} mins</span>
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Tracking Marker during playback or on selected node */}
        {currentStop && currentStop.latitude && currentStop.longitude && (
          <Marker
            position={[currentStop.latitude, currentStop.longitude]}
            icon={createActiveTrackerMarker(currentStop.plate_text)}
            zIndexOffset={1000}
          />
        )}
      </MapContainer>

      {/* TOP FLOATING CONTROLS & HUD */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setTriggerFit((p) => p + 1)}
          className="h-8 px-2.5 bg-[#0D1520]/90 hover:bg-[#121E2E] backdrop-blur-md border border-[#1C2E42] text-white rounded-[4px] text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
          title="Fit entire vehicle trajectory in view"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#0E7FE0]" />
          <span>Fit Route</span>
        </button>

        {/* Layer Selector */}
        <div className="flex bg-[#0D1520]/90 backdrop-blur-md border border-[#1C2E42] rounded-[4px] p-0.5 shadow-lg">
          <button
            onClick={() => setMapLayer('dark')}
            className={`px-2 py-1 text-[10px] font-mono rounded-[3px] transition-colors ${
              mapLayer === 'dark'
                ? 'bg-[#0E7FE0] text-white font-bold'
                : 'text-[#8FA8C0] hover:text-white'
            }`}
          >
            Dark Grid
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2 py-1 text-[10px] font-mono rounded-[3px] transition-colors ${
              mapLayer === 'satellite'
                ? 'bg-[#0E7FE0] text-white font-bold'
                : 'text-[#8FA8C0] hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* TOP RIGHT TELEMETRY HUD */}
      {currentStop && (
        <div className="absolute top-3 right-3 z-[400] bg-[#0D1520]/90 backdrop-blur-md border border-[#1C2E42] rounded-[4px] p-2.5 shadow-xl text-right font-mono text-xs max-w-[220px] pointer-events-auto">
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#00C875] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-ping" />
            <span>RADAR LOCK</span>
          </div>
          <div className="text-white font-bold text-xs truncate">
            {currentStop.camera_identifier}: {currentStop.camera_name}
          </div>
          <div className="text-[#8FA8C0] text-[10px] truncate">{currentStop.location_name}</div>
          <div className="mt-1 pt-1 border-t border-[#1C2E42] flex items-center justify-between text-[10px]">
            <span className="text-[#8FA8C0]">NODE:</span>
            <span className="text-[#0E7FE0] font-bold">
              {(selectedStopIndex !== undefined ? selectedStopIndex : 0) + 1} / {stops.length}
            </span>
          </div>
        </div>
      )}

      {/* BOTTOM PLAYBACK CONTROLLER BAR */}
      {onTogglePlay && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-[#0D1520]/95 backdrop-blur-md border border-[#1C2E42] rounded-[6px] p-2.5 shadow-2xl flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`h-8 px-3 rounded-[4px] font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isPlaying
                  ? 'bg-[#FF8C00] text-[#080C12] hover:bg-[#FF8C00]/90'
                  : 'bg-[#0E7FE0] text-white hover:bg-[#1A9FFF]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play Trajectory'}</span>
            </button>

            {/* Speed Pills */}
            {onChangeSpeed && (
              <div className="hidden sm:flex items-center bg-[#080C12] border border-[#1C2E42] rounded-[4px] p-0.5">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChangeSpeed(spd)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-[3px] transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-[#1F3050] text-[#0E7FE0] font-bold'
                        : 'text-[#8FA8C0] hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrubber / Progress indicator */}
          <div className="flex-1 mx-2 hidden md:flex items-center gap-2 font-mono text-[10px] text-[#8FA8C0]">
            <span>Start</span>
            <div className="flex-1 h-1.5 bg-[#121E2E] rounded-full overflow-hidden border border-[#1C2E42]">
              <div
                className="h-full bg-[#0E7FE0] transition-all duration-300"
                style={{
                  width: `${
                    stops.length > 1
                      ? (((selectedStopIndex ?? 0) + 1) / stops.length) * 100
                      : 100
                  }%`,
                }}
              />
            </div>
            <span>End ({stops.length} Nodes)</span>
          </div>

          <div className="font-mono text-xs text-[#00C875] flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>EST. SPEED: {currentStop?.speed_kmh || 48} km/h</span>
          </div>
        </div>
      )}
    </div>
  );
};
