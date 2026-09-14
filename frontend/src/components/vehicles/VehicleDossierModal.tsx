import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { vehiclesApi } from '../../api/vehicles';
import { VehicleDossier } from '../../types';
import {
  X,
  User,
  Shield,
  ShieldAlert,
  Car,
  FileText,
  Copy,
  Check,
  Printer,
  Radio,
  MapPin,
  FileCheck,
  Siren,
  Compass,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DEMO_MODE } from '../../utils/demo';
import { Modal } from '../ui/Modal';

interface VehicleDossierModalProps {
  plate: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleDossierModal: React.FC<VehicleDossierModalProps> = ({
  plate,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<VehicleDossier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'owner' | 'specs' | 'cctns'>('overview');

  useEffect(() => {
    if (!isOpen || !plate) {
      setDossier(null);
      return;
    }

    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    setIsLoading(true);

    vehiclesApi
      .getDossier(cleanPlate)
      .then((data) => {
        setDossier(data);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to fetch vehicle dossier');
        setIsLoading(false);
      });
  }, [isOpen, plate]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !plate) return null;
  if (DEMO_MODE) return <Modal isOpen={isOpen} onClose={onClose} title={`Sample vehicle · ${plate}`}><div className="space-y-4"><div className="demo-notice">No official owner or criminal record is connected. This plate belongs to a fictional demonstration scenario.</div><button className="primary-action" onClick={() => {onClose(); navigate(`/vehicles/details/${encodeURIComponent(plate)}`);}}>Open sample vehicle record</button></div></Modal>;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDispatchPatrol = () => {
    toast.success(`🚨 BOLO Broadcast Issued! Nearby Patrol Units alerted to intercept ${plate}.`);
  };

  const isCritical = dossier?.intelligence.threat_level === 'CRITICAL';
  const isHigh = dossier?.intelligence.threat_level === 'HIGH';
  const isWatchlist = dossier?.intelligence.is_watchlist;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0A1017] border border-[#1F334D] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0D1522] border-b border-[#1C2E42] shrink-0">
          <div className="flex items-center gap-3">
            {/* Indian License Plate Pill */}
            <div className="flex items-center bg-white text-black font-mono font-black text-sm px-2.5 py-1 rounded-[4px] border border-gray-300 shadow-md tracking-wider">
              <span className="bg-[#0E7FE0] text-white text-[9px] px-1 py-0.5 rounded-[2px] mr-1.5 font-bold">
                IND
              </span>
              <span>{dossier?.plate_text || plate}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {dossier ? `${dossier.specs.make} ${dossier.specs.model}` : 'Vehicle Registration Record'}
                </h2>
                <span className="bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  VAHAN 4.0
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#8FA8C0] mt-0.5">
                {dossier?.registration.rto_office || 'Regional Transport Office, Gujarat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Threat Badge */}
            {dossier && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold shadow ${
                  isCritical
                    ? 'bg-[#FF3B3B] text-white animate-pulse'
                    : isHigh
                    ? 'bg-[#FF8C00] text-white'
                    : 'bg-[#00C875]/20 border border-[#00C875] text-[#00C875]'
                }`}
              >
                {isWatchlist ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>
                  {isCritical
                    ? 'CRITICAL WARRANT'
                    : isHigh
                    ? 'WATCHLIST TARGET'
                    : 'CLEAR RECORD'}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                navigate(`/vehicles/details/${encodeURIComponent(dossier?.plate_text || plate)}`);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0E7FE0]/20 hover:bg-[#0E7FE0]/30 text-[#0E7FE0] border border-[#0E7FE0]/40 text-xs font-mono font-medium transition-colors cursor-pointer"
              title="Open full dedicated Vehicle Details page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Dossier Page</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#080C14] border-b border-[#1C2E42] shrink-0">
          <div className="flex items-center gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'owner', label: 'Owner & Address' },
              { id: 'specs', label: 'Vehicle Specs' },
              { id: 'cctns', label: 'Police & CCTNS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1 rounded-[5px] text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0E7FE0] text-white font-bold shadow'
                    : 'bg-[#0D1520] text-[#8FA8C0] hover:text-white border border-[#1C2E42]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#4D6B85] hidden sm:block">
            SECURITY LEVEL: LAW ENFORCEMENT ACCESS ONLY
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-2 border-[#0E7FE0] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-[#8FA8C0]">
                Querying Vahan RTO National Database & Police CCTNS Repository...
              </span>
            </div>
          ) : !dossier ? (
            <div className="text-center py-20 text-xs font-mono text-[#8FA8C0]">
              No record found for {plate}.
            </div>
          ) : (
            <>
              {/* WATCHLIST CALLOUT BANNER */}
              {isWatchlist ? (
                <div className="p-4 bg-[#1A0808] border-l-4 border-l-[#FF3B3B] border border-[#FF3B3B]/40 rounded-[6px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-[#FF3B3B]/20 text-[#FF3B3B] shrink-0 mt-0.5">
                      <Siren className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#FF3B3B] uppercase tracking-wider">
                          ALERT NOTICE: {dossier.intelligence.alert_type}
                        </span>
                        <span className="text-[9px] font-mono bg-[#FF3B3B] text-white px-1.5 py-0.2 rounded font-bold">
                          NBW WARRANT ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-[#E8EFF7] font-mono mt-1 leading-relaxed">
                        {dossier.intelligence.notes}
                      </p>
                      <div className="text-[11px] font-mono text-[#FF8C00] mt-1.5 flex flex-wrap items-center gap-3">
                        <span>CASE: <strong>{dossier.intelligence.case_number}</strong></span>
                        <span>•</span>
                        <span>SECTIONS: <strong>{dossier.intelligence.sections_applied}</strong></span>
                        <span>•</span>
                        <span>IO: <strong>{dossier.intelligence.investigating_officer}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDispatchPatrol}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#FF3B3B] hover:bg-[#E02E2E] text-white rounded-[4px] text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(255,59,59,0.5)] cursor-pointer"
                  >
                    <Siren className="w-4 h-4" />
                    DISPATCH INTERCEPT PATROL
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#08150D] border-l-4 border-l-[#00C875] border border-[#00C875]/30 rounded-[6px] flex items-center gap-2.5 text-xs font-mono text-[#00C875]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    VERIFIED CIVILIAN RECORD · No active warrants or vehicle blacklists recorded in National CCTNS repository.
                  </span>
                </div>
              )}

              {/* THREE MAIN DETAIL CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. REGISTERED OWNER */}
                {(activeTab === 'overview' || activeTab === 'owner') && (
                  <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[8px] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#0E7FE0]" />
                          Registered Owner
                        </h3>
                        <span className="text-[9px] font-mono text-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded border border-[#00C875]/30">
                          VERIFIED
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">LEGAL OWNER NAME</span>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {dossier.owner.name}
                          </div>
                          <div className="text-[10px] text-[#0E7FE0] mt-0.5 font-semibold">
                            {dossier.owner.ownership_type}
                          </div>
                        </div>

                        {dossier.owner.father_name && (
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">FATHER'S / HUSBAND'S NAME</span>
                            <div className="text-white mt-0.5">
                              {dossier.owner.father_name}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">REGISTERED ADDRESS</span>
                          <div className="text-white text-[11px] leading-relaxed mt-0.5 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#0E7FE0] shrink-0 mt-0.5" />
                            <span>{dossier.owner.address}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2E42]/60">
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">LINKED MOBILE</span>
                            <div className="text-white font-bold mt-0.5">
                              {dossier.owner.phone_masked}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">AADHAAR HASH</span>
                            <div className="text-white mt-0.5">
                              {dossier.owner.aadhaar_masked || '•••• •••• 4920'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#1C2E42]/60 text-[10px] font-mono text-[#8FA8C0] flex items-center justify-between">
                      <span>KYC STATUS: COMPLETE</span>
                      <span className="text-[#00C875]">DIGILOCKER SYNCED</span>
                    </div>
                  </div>
                )}

                {/* 2. VEHICLE SPECIFICATIONS */}
                {(activeTab === 'overview' || activeTab === 'specs') && (
                  <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[8px] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-[#00C875]" />
                          Vehicle Specifications
                        </h3>
                        <span className="text-[9px] font-mono text-[#0E7FE0] bg-[#0E7FE0]/10 px-1.5 py-0.5 rounded border border-[#0E7FE0]/30">
                          {dossier.specs.fuel_type.split(' ')[0]}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">MAKE & MODEL</span>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {dossier.specs.make} {dossier.specs.model}
                          </div>
                          {dossier.specs.variant && (
                            <div className="text-[10px] text-[#8FA8C0]">{dossier.specs.variant}</div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">PAINT / COLOR</span>
                            <div className="text-white font-bold mt-0.5">
                              {dossier.specs.color}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">ENGINE CAPACITY</span>
                            <div className="text-white font-bold mt-0.5">
                              {dossier.specs.cubic_capacity}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">CHASSIS NUMBER (VIN)</span>
                          <div className="flex items-center justify-between bg-[#080C12] px-2 py-1 rounded border border-[#1C2E42] mt-0.5 text-[11px]">
                            <code className="text-white">{dossier.specs.chassis_number}</code>
                            <button
                              onClick={() => handleCopy(dossier.specs.chassis_number, 'VIN')}
                              className="text-[#8FA8C0] hover:text-white"
                            >
                              {copiedField === 'VIN' ? <Check className="w-3 h-3 text-[#00C875]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">ENGINE NUMBER</span>
                          <div className="flex items-center justify-between bg-[#080C12] px-2 py-1 rounded border border-[#1C2E42] mt-0.5 text-[11px]">
                            <code className="text-white">{dossier.specs.engine_number}</code>
                            <button
                              onClick={() => handleCopy(dossier.specs.engine_number, 'Engine No')}
                              className="text-[#8FA8C0] hover:text-white"
                            >
                              {copiedField === 'Engine No' ? <Check className="w-3 h-3 text-[#00C875]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2E42]/60">
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">SEATING</span>
                            <div className="text-white mt-0.5">{dossier.specs.seating_capacity} Persons</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">EMISSION</span>
                            <div className="text-[#00C875] font-bold mt-0.5">{dossier.specs.emission_norm}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#1C2E42]/60 text-[10px] font-mono text-[#8FA8C0] flex items-center justify-between">
                      <span>CLASS: LMV PRIVATE</span>
                      <span className="text-[#0E7FE0]">OBD-II TELEMETRIC</span>
                    </div>
                  </div>
                )}

                {/* 3. REGISTRATION & COMPLIANCE */}
                {(activeTab === 'overview' || activeTab === 'cctns') && (
                  <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[8px] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#FF8C00]" />
                          Registration & Compliance
                        </h3>
                        <span className="text-[9px] font-mono text-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded border border-[#00C875]/30">
                          {dossier.registration.rc_status.split('/')[0]}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">RTO OFFICE JURISDICTION</span>
                          <div className="text-white font-bold text-[11px] mt-0.5">
                            {dossier.registration.rto_office}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">REGISTERED DATE</span>
                            <div className="text-white mt-0.5">{dossier.registration.registration_date}</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8FA8C0] uppercase">FITNESS UPTO</span>
                            <div className="text-[#00C875] font-bold mt-0.5">{dossier.registration.fitness_valid_upto}</div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">INSURANCE POLICY</span>
                          <div className="text-white text-[11px] mt-0.5">
                            {dossier.registration.insurance_company}
                          </div>
                          <div className="text-[10px] text-[#8FA8C0] mt-0.5">
                            Policy: {dossier.registration.insurance_policy_no} (Valid till {dossier.registration.insurance_valid_upto})
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1C2E42]/60">
                          <span className="text-[10px] text-[#8FA8C0] uppercase">PUCC POLLUTION STATUS</span>
                          <div className="text-[#00C875] font-bold text-[11px] mt-0.5">
                            VALID (GREEN) · Upto {dossier.registration.pucc_valid_upto}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#8FA8C0] uppercase">FASTAG RFID STATUS</span>
                          <div className="text-white text-[11px] mt-0.5 font-bold">
                            {dossier.registration.fastag_status}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#1C2E42]/60 text-[10px] font-mono text-[#8FA8C0] flex items-center justify-between">
                      <span>ROAD TAX: PAID</span>
                      <span className="text-[#00C875]">GREEN TAX COMPLIANT</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SURVEILLANCE TELEMETRY BAR */}
              <div className="p-3.5 bg-[#0D1520] border border-[#1C2E42] rounded-[8px] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#0E7FE0]/15 text-[#0E7FE0]">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[#8FA8C0] text-[10px] uppercase">
                      ACTIVE SURVEILLANCE INTELLIGENCE
                    </div>
                    <div className="text-white font-bold mt-0.5">
                      Last Sighted: {dossier.telemetry.last_camera_name} ({dossier.telemetry.last_camera_id})
                    </div>
                    <div className="text-[10px] text-[#4D6B85] mt-0.5">
                      Location: {dossier.telemetry.last_location} · Sighted {dossier.telemetry.total_sightings_today} times today
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/vehicles/journey/${dossier.plate_text}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E7FE0] hover:bg-[#0c6ec2] text-white rounded text-xs font-bold transition-colors shadow cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    TRACE JOURNEY MAP
                  </button>

                  <button
                    onClick={() => {
                      toast.success(`Section 65B legal certificate generated for ${dossier.plate_text}`);
                      onClose();
                      navigate('/evidence');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00C875]/20 hover:bg-[#00C875]/30 border border-[#00C875] text-[#00C875] rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    PRESERVE EVIDENCE
                  </button>
                </div>
              </div>

              {/* SECTION 65B DIGITAL SIGNATURE BAR */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#070B10] border border-[#1C2E42] rounded text-[10px] font-mono text-[#8FA8C0]">
                <div className="truncate flex items-center gap-1.5">
                  <span className="text-[#0E7FE0]">BSA / SEC 65B DIGITAL SIGNATURE:</span>
                  <span className="text-white font-bold">{dossier.digital_signature}</span>
                </div>
                <button
                  onClick={() => handleCopy(dossier.digital_signature, 'Digital Signature Hash')}
                  className="shrink-0 ml-2 text-[#8FA8C0] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  COPY HASH
                </button>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-[#0D1522] border-t border-[#1C2E42] flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-[#8FA8C0]">
            Press <kbd className="px-1.5 py-0.5 bg-[#1C2E42] text-white rounded text-[10px]">Esc</kbd> to close dossier
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] rounded text-xs font-mono transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT DOSSIER
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0E7FE0] hover:bg-[#0c6ec2] text-white font-bold rounded text-xs font-mono transition-colors shadow cursor-pointer"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
