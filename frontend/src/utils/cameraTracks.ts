export interface TrackedVehicle {
  id: string;
  trackId: string;
  plate: string;
  vclass: 'CAR' | 'TRUCK' | 'BUS' | 'BIKE' | 'SUV';
  conf: number;
  speedKmh: number;
  isWatchlist: boolean;
  watchlistReason?: string;
  // Normalized coordinates (0 - 100%)
  x: number;
  y: number;
  w: number;
  h: number;
  lane: number;
  scanProgress: number; // 0 to 1 along trajectory
  isScanned: boolean; // passed the ANPR scan threshold
}

interface TrajectoryPoint {
  progress: number; // 0 to 1
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LaneDefinition {
  laneId: number;
  speedKmh: number;
  durationSec: number;
  path: TrajectoryPoint[];
}

interface VehicleSchedule {
  plate: string;
  vclass: 'CAR' | 'TRUCK' | 'BUS' | 'BIKE' | 'SUV';
  conf: number;
  laneId: number;
  startOffsetSec: number; // offset within the video cycle
  isWatchlist: boolean;
  watchlistReason?: string;
}

// Pre-defined perspective trajectories for each camera based on its video layout
const CAMERA_LANES: Record<string, LaneDefinition[]> = {
  // CAM01 — MG Road Junction (cross traffic & pedestrian intersection)
  CAM01: [
    {
      laneId: 1,
      speedKmh: 42,
      durationSec: 10,
      path: [
        { progress: 0.0, x: 12, y: 55, w: 12, h: 14 },
        { progress: 0.4, x: 34, y: 58, w: 16, h: 18 },
        { progress: 0.7, x: 58, y: 62, w: 20, h: 22 },
        { progress: 1.0, x: 86, y: 68, w: 24, h: 26 },
      ],
    },
    {
      laneId: 2,
      speedKmh: 54,
      durationSec: 8,
      path: [
        { progress: 0.0, x: 82, y: 38, w: 9, h: 11 },
        { progress: 0.5, x: 52, y: 44, w: 13, h: 15 },
        { progress: 0.8, x: 28, y: 50, w: 17, h: 19 },
        { progress: 1.0, x: 5, y: 56, w: 20, h: 22 },
      ],
    },
  ],

  // CAM02 — Sardar Bridge Entry (highway aerial overpass with 3 lanes)
  CAM02: [
    {
      laneId: 1, // Left lane (white SUV / truck)
      speedKmh: 68,
      durationSec: 9,
      path: [
        { progress: 0.0, x: 17, y: 15, w: 10, h: 10 },
        { progress: 0.3, x: 19, y: 35, w: 14, h: 14 },
        { progress: 0.6, x: 21, y: 55, w: 18, h: 18 },
        { progress: 1.0, x: 23, y: 82, w: 22, h: 24 },
      ],
    },
    {
      laneId: 2, // Center lane (fast sedan)
      speedKmh: 75,
      durationSec: 7,
      path: [
        { progress: 0.0, x: 51, y: 18, w: 9, h: 10 },
        { progress: 0.4, x: 53, y: 42, w: 13, h: 15 },
        { progress: 0.7, x: 55, y: 66, w: 17, h: 19 },
        { progress: 1.0, x: 57, y: 92, w: 21, h: 23 },
      ],
    },
    {
      laneId: 3, // Right lane (commuter)
      speedKmh: 62,
      durationSec: 11,
      path: [
        { progress: 0.0, x: 74, y: 22, w: 9, h: 9 },
        { progress: 0.5, x: 76, y: 48, w: 13, h: 14 },
        { progress: 0.8, x: 78, y: 72, w: 16, h: 18 },
        { progress: 1.0, x: 80, y: 95, w: 20, h: 22 },
      ],
    },
  ],

  // CAM03 — Vastrapur Lake Gate (highway corridor next to median divider)
  CAM03: [
    {
      laneId: 1, // Lane next to divider
      speedKmh: 58,
      durationSec: 10,
      path: [
        { progress: 0.0, x: 54, y: 18, w: 6, h: 6 },
        { progress: 0.3, x: 56, y: 34, w: 10, h: 11 },
        { progress: 0.6, x: 58, y: 54, w: 14, h: 16 },
        { progress: 1.0, x: 61, y: 80, w: 18, h: 21 },
      ],
    },
    {
      laneId: 2, // Outer lane (trucks & heavier traffic)
      speedKmh: 48,
      durationSec: 12,
      path: [
        { progress: 0.0, x: 71, y: 22, w: 7, h: 8 },
        { progress: 0.4, x: 73, y: 42, w: 12, h: 14 },
        { progress: 0.7, x: 75, y: 64, w: 16, h: 20 },
        { progress: 1.0, x: 78, y: 88, w: 21, h: 26 },
      ],
    },
  ],

  // CAM04 — SG Highway Toll (toll plaza approach)
  CAM04: [
    {
      laneId: 1,
      speedKmh: 35,
      durationSec: 12,
      path: [
        { progress: 0.0, x: 30, y: 25, w: 14, h: 16 },
        { progress: 0.4, x: 33, y: 42, w: 19, h: 22 },
        { progress: 0.7, x: 36, y: 60, w: 24, h: 28 },
        { progress: 1.0, x: 38, y: 82, w: 28, h: 34 },
      ],
    },
    {
      laneId: 2,
      speedKmh: 45,
      durationSec: 10,
      path: [
        { progress: 0.0, x: 60, y: 28, w: 10, h: 11 },
        { progress: 0.5, x: 63, y: 48, w: 15, h: 17 },
        { progress: 0.8, x: 65, y: 68, w: 19, h: 21 },
        { progress: 1.0, x: 67, y: 90, w: 23, h: 25 },
      ],
    },
  ],

  // CAM05 — Gandhinagar Sector 15
  CAM05: [
    {
      laneId: 1,
      speedKmh: 50,
      durationSec: 8,
      path: [
        { progress: 0.0, x: 22, y: 45, w: 12, h: 13 },
        { progress: 0.5, x: 48, y: 50, w: 16, h: 18 },
        { progress: 1.0, x: 78, y: 55, w: 21, h: 23 },
      ],
    },
  ],

  // CAM06 — GIFT City Entry
  CAM06: [
    {
      laneId: 1,
      speedKmh: 60,
      durationSec: 9,
      path: [
        { progress: 0.0, x: 42, y: 25, w: 10, h: 11 },
        { progress: 0.5, x: 45, y: 48, w: 15, h: 17 },
        { progress: 1.0, x: 49, y: 78, w: 22, h: 24 },
      ],
    },
    {
      laneId: 2,
      speedKmh: 52,
      durationSec: 11,
      path: [
        { progress: 0.0, x: 22, y: 28, w: 12, h: 14 },
        { progress: 0.5, x: 25, y: 52, w: 18, h: 21 },
        { progress: 1.0, x: 28, y: 82, w: 24, h: 28 },
      ],
    },
  ],

  // CAM07 — Sabarmati Riverfront
  CAM07: [
    {
      laneId: 1,
      speedKmh: 45,
      durationSec: 12,
      path: [
        { progress: 0.0, x: 25, y: 42, w: 11, h: 12 },
        { progress: 0.5, x: 50, y: 46, w: 15, h: 16 },
        { progress: 1.0, x: 78, y: 52, w: 20, h: 22 },
      ],
    },
  ],

  // CAM08 — GNLU Gate
  CAM08: [
    {
      laneId: 1,
      speedKmh: 48,
      durationSec: 10,
      path: [
        { progress: 0.0, x: 40, y: 25, w: 10, h: 11 },
        { progress: 0.5, x: 43, y: 48, w: 15, h: 17 },
        { progress: 1.0, x: 46, y: 76, w: 21, h: 23 },
      ],
    },
  ],

  // CAM09 — Chiloda Circle
  CAM09: [
    {
      laneId: 1,
      speedKmh: 38,
      durationSec: 11,
      path: [
        { progress: 0.0, x: 20, y: 35, w: 14, h: 16 },
        { progress: 0.5, x: 48, y: 42, w: 19, h: 21 },
        { progress: 1.0, x: 78, y: 50, w: 25, h: 27 },
      ],
    },
  ],

  // CAM10 — Kudasan Junction
  CAM10: [
    {
      laneId: 1,
      speedKmh: 52,
      durationSec: 9,
      path: [
        { progress: 0.0, x: 44, y: 30, w: 11, h: 12 },
        { progress: 0.5, x: 48, y: 52, w: 16, h: 18 },
        { progress: 1.0, x: 52, y: 80, w: 22, h: 24 },
      ],
    },
  ],
};

// Vehicles that appear in each camera with exact timing offsets
const CAMERA_VEHICLES: Record<string, VehicleSchedule[]> = {
  CAM01: [
    {
      plate: 'GJ01AB1234',
      vclass: 'CAR',
      conf: 0.98,
      laneId: 1,
      startOffsetSec: 0.5,
      isWatchlist: true,
      watchlistReason: 'Kidnapping & Extortion Syndicate Lead Vehicle (FIR 2024/098)',
    },
    {
      plate: 'GJ18IJ7890',
      vclass: 'BIKE',
      conf: 0.94,
      laneId: 2,
      startOffsetSec: 2.0,
      isWatchlist: false,
    },
    {
      plate: 'GJ05CD5678',
      vclass: 'CAR',
      conf: 0.96,
      laneId: 1,
      startOffsetSec: 8.5,
      isWatchlist: true,
      watchlistReason: 'Fatal Hit & Run Collision on SG Highway Corridor',
    },
  ],

  CAM02: [
    {
      plate: 'MH12EF9012',
      vclass: 'SUV',
      conf: 0.97,
      laneId: 1,
      startOffsetSec: 0.0,
      isWatchlist: false,
    },
    {
      plate: 'GJ01AB1234',
      vclass: 'CAR',
      conf: 0.98,
      laneId: 2,
      startOffsetSec: 1.2,
      isWatchlist: true,
      watchlistReason: 'Kidnapping & Extortion Syndicate Lead Vehicle (FIR 2024/098)',
    },
    {
      plate: 'RJ14GH3456',
      vclass: 'CAR',
      conf: 0.95,
      laneId: 3,
      startOffsetSec: 3.5,
      isWatchlist: true,
      watchlistReason: 'Reported Stolen Luxury Fortuner - Armed Jewelry Heist',
    },
    {
      plate: 'GJ01MN4455',
      vclass: 'CAR',
      conf: 0.94,
      laneId: 2,
      startOffsetSec: 9.0,
      isWatchlist: false,
    },
  ],

  CAM03: [
    {
      plate: 'UP32PQ6677',
      vclass: 'CAR',
      conf: 0.96,
      laneId: 1,
      startOffsetSec: 0.5,
      isWatchlist: true,
      watchlistReason: 'Interstate Narcotics Trafficking Conduit',
    },
    {
      plate: 'GJ01TT6655',
      vclass: 'TRUCK',
      conf: 0.93,
      laneId: 2,
      startOffsetSec: 1.8,
      isWatchlist: false,
    },
    {
      plate: 'DL8CBB4411',
      vclass: 'CAR',
      conf: 0.95,
      laneId: 1,
      startOffsetSec: 11.0,
      isWatchlist: false,
    },
  ],

  CAM04: [
    {
      plate: 'HR26TU1122',
      vclass: 'TRUCK',
      conf: 0.95,
      laneId: 1,
      startOffsetSec: 0.0,
      isWatchlist: false,
    },
    {
      plate: 'GJ01AB1234',
      vclass: 'CAR',
      conf: 0.98,
      laneId: 2,
      startOffsetSec: 2.5,
      isWatchlist: true,
      watchlistReason: 'Kidnapping & Extortion Syndicate Lead Vehicle (FIR 2024/098)',
    },
    {
      plate: 'GJ27XY9900',
      vclass: 'CAR',
      conf: 0.92,
      laneId: 2,
      startOffsetSec: 13.0,
      isWatchlist: false,
    },
  ],

  CAM05: [
    {
      plate: 'GJ18ZZ3322',
      vclass: 'CAR',
      conf: 0.96,
      laneId: 1,
      startOffsetSec: 0.0,
      isWatchlist: false,
    },
  ],

  CAM06: [
    {
      plate: 'GJ06ZA1010',
      vclass: 'CAR',
      conf: 0.97,
      laneId: 1,
      startOffsetSec: 0.5,
      isWatchlist: false,
    },
    {
      plate: 'RJ19BB7766',
      vclass: 'BUS',
      conf: 0.94,
      laneId: 2,
      startOffsetSec: 2.0,
      isWatchlist: false,
    },
  ],

  CAM07: [
    {
      plate: 'GJ27XY9900',
      vclass: 'CAR',
      conf: 0.95,
      laneId: 1,
      startOffsetSec: 1.0,
      isWatchlist: false,
    },
  ],

  CAM08: [
    {
      plate: 'GJ02AA8811',
      vclass: 'CAR',
      conf: 0.96,
      laneId: 1,
      startOffsetSec: 0.5,
      isWatchlist: false,
    },
  ],

  CAM09: [
    {
      plate: 'MH04DE8080',
      vclass: 'TRUCK',
      conf: 0.93,
      laneId: 1,
      startOffsetSec: 1.0,
      isWatchlist: false,
    },
  ],

  CAM10: [
    {
      plate: 'GJ09RS8899',
      vclass: 'CAR',
      conf: 0.95,
      laneId: 1,
      startOffsetSec: 0.5,
      isWatchlist: false,
    },
  ],
};

function interpolateTrajectory(path: TrajectoryPoint[], progress: number): { x: number; y: number; w: number; h: number } {
  if (path.length === 0) return { x: 50, y: 50, w: 20, h: 20 };
  if (progress <= path[0].progress) {
    const p = path[0];
    return { x: p.x, y: p.y, w: p.w, h: p.h };
  }
  if (progress >= path[path.length - 1].progress) {
    const p = path[path.length - 1];
    return { x: p.x, y: p.y, w: p.w, h: p.h };
  }

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    if (progress >= p1.progress && progress <= p2.progress) {
      const segLen = p2.progress - p1.progress;
      const t = segLen > 0 ? (progress - p1.progress) / segLen : 0;
      return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
        w: p1.w + (p2.w - p1.w) * t,
        h: p1.h + (p2.h - p1.h) * t,
      };
    }
  }

  const last = path[path.length - 1];
  return { x: last.x, y: last.y, w: last.w, h: last.h };
}

/**
 * Returns the currently active vehicles and their interpolated coordinates
 * for the given camera at currentTime seconds.
 */
export function getTrackedVehiclesAtTime(
  cameraIdentifier: string,
  currentTimeSec: number
): TrackedVehicle[] {
  // Extract CAM01 - CAM10
  const match = cameraIdentifier.match(/CAM\d+/);
  const camKey = match ? match[0] : 'CAM01';

  const lanes = CAMERA_LANES[camKey] || CAMERA_LANES['CAM01'];
  const schedules = CAMERA_VEHICLES[camKey] || CAMERA_VEHICLES['CAM01'];

  const results: TrackedVehicle[] = [];

  for (let idx = 0; idx < schedules.length; idx++) {
    const sched = schedules[idx];
    const lane = lanes.find((l) => l.laneId === sched.laneId) || lanes[0];

    // Effective cycle duration
    const cycleDuration = Math.max(lane.durationSec + 4, 15);
    const elapsedInCycle = (currentTimeSec - sched.startOffsetSec + 1000 * cycleDuration) % cycleDuration;

    // Is the vehicle currently traversing the lane?
    if (elapsedInCycle >= 0 && elapsedInCycle <= lane.durationSec) {
      const progress = elapsedInCycle / lane.durationSec;
      const bbox = interpolateTrajectory(lane.path, progress);

      // Unique tracking ID consistent per schedule
      const trackId = `TRK-${camKey}-${sched.laneId}${idx + 1}`;

      // Mark scanned when vehicle crosses 50% of the corridor
      const isScanned = progress >= 0.45;

      results.push({
        id: `${trackId}-${sched.plate}`,
        trackId,
        plate: sched.plate,
        vclass: sched.vclass,
        conf: sched.conf,
        speedKmh: lane.speedKmh + (idx % 2 === 0 ? 2 : -3),
        isWatchlist: sched.isWatchlist,
        watchlistReason: sched.watchlistReason,
        x: Math.round(bbox.x * 10) / 10,
        y: Math.round(bbox.y * 10) / 10,
        w: Math.round(bbox.w * 10) / 10,
        h: Math.round(bbox.h * 10) / 10,
        lane: sched.laneId,
        scanProgress: progress,
        isScanned,
      });
    }
  }

  return results;
}
