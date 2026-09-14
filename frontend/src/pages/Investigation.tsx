import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { VehicleSightingCard } from '../components/vehicles/VehicleSightingCard';
import { JourneyMap } from '../components/vehicles/JourneyMap';
import { EvidenceExportModal } from '../components/evidence/EvidenceExportModal';
import { vehiclesApi } from '../api/vehicles';
import { evidenceApi } from '../api/evidence';
import { useCameras } from '../hooks/useCameras';
import { Sighting, VehicleJourney, Evidence } from '../types';
import { Search, Route, Archive, Compass, Filter, Calendar, User, FileText } from 'lucide-react';
import { VehicleDossierModal } from '../components/vehicles/VehicleDossierModal';
import { toast } from 'sonner';

export const Investigation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [plateInput, setPlateInput] = useState(searchParams.get('plate') || 'GJ01AB1234');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [journey, setJourney] = useState<VehicleJourney | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [preservedEvidenceModal, setPreservedEvidenceModal] = useState<Evidence | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const searchIdRef = useRef(0);

  const { data: cameras = [] } = useCameras();

  const performSearch = async (plateToSearch: string) => {
    if (!plateToSearch.trim()) {
      setSightings([]);
      setJourney(null);
      setSelectedSighting(null);
      return;
    }
    const currentSearchId = ++searchIdRef.current;
    setIsLoading(true);
    try {
      const clean = plateToSearch.replace(/\s/g, '').toUpperCase();
      const [sightingsRes, journeyRes] = await Promise.all([
        vehiclesApi.search({
          plate: clean,
          vehicle_class: selectedVehicleClass !== 'all' ? selectedVehicleClass : undefined,
          limit: 100,
        }),
        vehiclesApi.getJourney(clean),
      ]);

      if (currentSearchId !== searchIdRef.current) return;

      if (!sightingsRes.items || sightingsRes.items.length === 0) {
        setSightings([]);
        setJourney(null);
        setSelectedSighting(null);
      } else {
        setSightings(sightingsRes.items);
        setJourney(journeyRes);
        setSelectedSighting(sightingsRes.items[0]);
      }
    } catch (e: any) {
      if (currentSearchId !== searchIdRef.current) return;
      setSightings([]);
      setJourney(null);
      setSelectedSighting(null);
      toast.error(e.message || 'Search failed');
    } finally {
      if (currentSearchId === searchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const urlPlate = searchParams.get('plate');
    if (urlPlate) {
      setPlateInput(urlPlate);
      performSearch(urlPlate);
    } else {
      performSearch('GJ01AB1234');
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.get('plate') === plateInput) performSearch(plateInput);
    else setSearchParams({ plate: plateInput });
  };

  const handlePreserveEvidence = async (sighting: Sighting) => {
    try {
      const res = await evidenceApi.preserve(sighting.id, undefined, `CASE-INV-${sighting.plate_text}`);
      toast.success(`Evidence preserved for plate ${sighting.plate_text}. SHA-256 seal created.`);
      setPreservedEvidenceModal(res);
    } catch (err: any) {
      toast.error(err.message || 'Preservation failed');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehicle Cross-Camera Investigation"
        description="Comprehensive search and forensic trajectory analysis for vehicles of interest."
        actions={
          <Button
            variant="secondary"
            icon={<User className="w-4 h-4 text-[#00C875]" />}
            onClick={() => setIsDossierOpen(true)}
          >
            Vehicle & Owner Dossier (Vahan)
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-4 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
      >
        <div className="sm:col-span-5">
          <Input
            label="Registration Plate Number"
            value={plateInput}
            onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
            placeholder="e.g. GJ01AB1234"
            icon={<Search className="w-4 h-4" />}
            className="font-mono uppercase font-semibold"
          />
        </div>

        <div className="sm:col-span-4">
          <Select
            label="Vehicle Category Filter"
            value={selectedVehicleClass}
            onChange={(e) => setSelectedVehicleClass(e.target.value)}
            options={[
              { label: 'All Vehicle Classes', value: 'all' },
              { label: 'Car / Light Vehicle', value: 'car' },
              { label: 'Truck / Commercial', value: 'truck' },
              { label: 'Bus / Transit', value: 'bus' },
              { label: 'Motorcycle / Two-wheeler', value: 'motorcycle' },
            ]}
          />
        </div>

        <div className="sm:col-span-3">
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Execute Query
          </Button>
        </div>
      </form>

      {/* Journey Trajectory Summary Bar (if 2+ sightings) */}
      {journey && journey.stops.length >= 2 && (
        <div className="p-3 bg-[#121E2E] border border-[#0E7FE0]/40 rounded-[6px] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0E7FE0]/10 text-[#0E7FE0] rounded">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">
                Vehicle detected on {journey.unique_cameras} distinct camera grid nodes
              </div>
              <div className="text-[#8FA8C0] font-mono text-[11px]">
                Travel window: {journey.total_duration_mins} mins · Est. Distance: {journey.estimated_distance_km} km
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/vehicles/details/${encodeURIComponent(journey.plate_text)}`)}
            >
              Full Vehicle Dossier
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<User className="w-3.5 h-3.5" />}
              onClick={() => setIsDossierOpen(true)}
            >
              Quick Owner Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Route className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/journey?plate=${encodeURIComponent(journey.plate_text)}`)}
            >
              Reconstruct Journey
            </Button>
          </div>
        </div>
      )}

      {/* Results Workspace: Left Timeline (420px) + Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Timeline Panel */}
        <div className="lg:col-span-4 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] p-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42] mb-3">
            <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Chronological Sightings
            </span>
            <span className="text-xs font-mono text-[#0E7FE0] bg-[#121E2E] px-2 py-0.5 rounded border border-[#233A52]">
              {sightings.length} Found
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoading ? (
              <div className="text-center py-20 text-xs text-[#8FA8C0]">
                Scanning database sightings...
              </div>
            ) : sightings.length === 0 ? (
              <div className="text-center py-20 px-4">
                <Search className="w-8 h-8 mx-auto text-[#4D6B85] mb-2" />
                <h4 className="text-sm font-semibold text-white">No sightings found</h4>
                <p className="text-xs text-[#8FA8C0] mt-1">
                  This plate was not detected in the selected time window. Try expanding the date range or check if all cameras are online.
                </p>
              </div>
            ) : (
              sightings.map((s) => (
                <VehicleSightingCard
                  key={s.id}
                  sighting={s}
                  isSelected={selectedSighting?.id === s.id}
                  onSelect={(sighting) => setSelectedSighting(sighting)}
                  onPreserveEvidence={handlePreserveEvidence}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Map Panel */}
        <div className="lg:col-span-8 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-[#1C2E42] flex items-center justify-between text-xs bg-[#0A101A]">
            <span className="font-mono text-[#8FA8C0]">
              SURVEILLANCE GEOSPATIAL RECONSTRUCTION
            </span>
            <span className="font-mono text-[#00C875]">CARTO DARK LAYER ACTIVE</span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <JourneyMap
              stops={journey?.stops || []}
              pathCoordinates={journey?.path_coordinates || []}
              selectedStopIndex={
                selectedSighting
                  ? journey?.stops.findIndex((st) => st.sighting_id === selectedSighting.id)
                  : undefined
              }
              onStopSelect={(idx) => {
                const stop = journey?.stops[idx];
                if (stop) {
                  const matching = sightings.find((s) => s.id === stop.sighting_id);
                  if (matching) setSelectedSighting(matching);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Preserved Evidence Modal */}
      <EvidenceExportModal
        evidence={preservedEvidenceModal}
        isOpen={!!preservedEvidenceModal}
        onClose={() => setPreservedEvidenceModal(null)}
      />

      {/* VAHAN & CCTNS VEHICLE OWNER DOSSIER MODAL */}
      <VehicleDossierModal
        plate={plateInput}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
};
