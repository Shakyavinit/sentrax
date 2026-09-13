import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { EvidenceExportModal } from '../components/evidence/EvidenceExportModal';
import { evidenceApi } from '../api/evidence';
import { Evidence } from '../types';
import { Archive, Search, ShieldCheck, Download, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

export const EvidenceVaultPage: React.FC = () => {
  const [caseFilter, setCaseFilter] = useState('');
  const [plateFilter, setPlateFilter] = useState('');
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<Evidence | null>(null);

  const { data: evidenceList = [], isLoading, refetch } = useQuery({
    queryKey: ['evidenceList', caseFilter, plateFilter],
    queryFn: () =>
      evidenceApi.list({
        case_id: caseFilter || undefined,
        plate: plateFilter || undefined,
        limit: 50,
      }),
    refetchInterval: 15000,
  });

  const handleExportZip = async (ev: Evidence) => {
    try {
      const blob = await evidenceApi.exportZip(ev.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence_${ev.plate_text || 'export'}_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Evidence ZIP package downloaded.');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleBulkExport = async () => {
    if (evidenceList.length === 0) return;
    try {
      const ids = evidenceList.map((e) => e.id);
      const blob = await evidenceApi.bulkExport(ids, 'BATCH_EXPORT');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk_evidence_batch_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Bulk evidence package downloaded.');
    } catch {
      toast.error('Bulk export failed');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Forensic Evidence Vault"
        description="Tamper-evident digital evidence repository with cryptographically verified SHA-256 integrity."
        actions={
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleBulkExport}
            disabled={evidenceList.length === 0}
          >
            Export Complete Batch (ZIP)
          </Button>
        }
      />

      {/* Filters */}
      <div className="p-4 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="sm:col-span-6">
          <Input
            label="Search by Vehicle Plate"
            placeholder="e.g. GJ01AB1234"
            value={plateFilter}
            onChange={(e) => setPlateFilter(e.target.value.toUpperCase())}
            icon={<Search className="w-4 h-4" />}
            className="font-mono uppercase"
          />
        </div>
        <div className="sm:col-span-6">
          <Input
            label="Case / FIR Reference"
            placeholder="e.g. CASE-GJ-2024"
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            icon={<Archive className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Evidence 4-Column Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-[#8FA8C0]">
          Loading forensic vault packages...
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="p-16 text-center border border-[#1C2E42] rounded-[6px] bg-[#0D1520]">
          <PackageOpen className="w-10 h-10 mx-auto text-[#4D6B85] mb-2" />
          <h3 className="text-sm font-semibold text-white">No preserved evidence</h3>
          <p className="text-xs text-[#8FA8C0] mt-1 max-w-md mx-auto">
            Evidence is automatically preserved when a watchlist alert is acknowledged, or can be
            manually preserved from any vehicle sighting in the Investigation view.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {evidenceList.map((ev) => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              onView={(item) => setActiveEvidenceModal(item)}
              onExport={handleExportZip}
            />
          ))}
        </div>
      )}

      <EvidenceExportModal
        evidence={activeEvidenceModal}
        isOpen={!!activeEvidenceModal}
        onClose={() => setActiveEvidenceModal(null)}
      />
    </div>
  );
};
