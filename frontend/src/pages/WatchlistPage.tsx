import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LicensePlate } from '../components/ui/LicensePlate';
import { watchlistApi } from '../api/watchlist';
import { alertsApi } from '../api/alerts';
import { WatchlistEntry, WatchlistPriority } from '../types';
import { formatTimestamp } from '../utils/format';
import { Eye, Plus, ShieldAlert, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const WatchlistPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [plate, setPlate] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<WatchlistPriority>('high');
  const [notes, setNotes] = useState('');

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistApi.list(false),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: watchlistApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success(`Plate ${plate} added to active surveillance watchlist`);
      setPlate('');
      setReason('');
      setNotes('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add target to watchlist');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: watchlistApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.info('Target plate deactivated');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !reason.trim()) {
      toast.error('Plate and reason are mandatory');
      return;
    }
    createMutation.mutate({
      plate_text: plate.replace(/\s/g, '').toUpperCase(),
      reason,
      priority,
      notes,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Surveillance Target Watchlist"
        description="Manage flagged vehicle registrations for automated real-time alerts across camera streams."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Watchlist Entries Table */}
        <div className="lg:col-span-8 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-3 border-b border-[#1C2E42] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Monitored Target Vehicles ({watchlist.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121E2E] text-[#8FA8C0] text-[11px] font-mono border-b border-[#1C2E42] uppercase">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Target Plate</th>
                  <th className="py-2.5 px-3 font-medium">Priority</th>
                  <th className="py-2.5 px-4 font-medium">Investigation Reason</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Alerts</th>
                  <th className="py-2.5 px-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2E42]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#8FA8C0]">
                      Loading watchlist database...
                    </td>
                  </tr>
                ) : watchlist.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#8FA8C0]">
                      No vehicle registrations currently flagged in watchlist.
                    </td>
                  </tr>
                ) : (
                  watchlist.map((item) => (
                    <tr key={item.id} className="hover:bg-[#121E2E]/60 transition-colors">
                      <td className="py-3 px-4">
                        <LicensePlate plate={item.plate_text} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            item.priority === 'critical'
                              ? 'alert'
                              : item.priority === 'high'
                              ? 'warn'
                              : 'info'
                          }
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#E8EFF7] max-w-[240px] truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase ${
                            item.active ? 'text-[#00C875]' : 'text-[#4D6B85]'
                          }`}
                        >
                          {item.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#FF3B3B]">
                        {(alerts.filter((a) => a.plate_text === item.plate_text).length || item.alert_count || 0)} hits
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => navigate(`/investigation?plate=${item.plate_text}`)}
                          className="p-1.5 text-[#8FA8C0] hover:text-[#0E7FE0] hover:bg-[#121E2E] rounded"
                          title="Investigate Plate"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        {item.active && (
                          <button
                            onClick={() => deactivateMutation.mutate(item.id)}
                            className="p-1.5 text-[#8FA8C0] hover:text-[#FF3B3B] hover:bg-[#121E2E] rounded"
                            title="Deactivate Target"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Add Target Form */}
        <div className="lg:col-span-4">
          <Card title="Flag New Vehicle Target" subtitle="Add registration plate to real-time watchlist alert grid">
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <Input
                label="License Plate Number"
                placeholder="e.g. GJ01AB1234"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                required
                className="font-mono uppercase font-bold"
              />

              <Select
                label="Interception Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as WatchlistPriority)}
                options={[
                  { label: 'High Priority', value: 'high' },
                  { label: 'Critical Priority (Immediate Alert)', value: 'critical' },
                  { label: 'Medium Priority', value: 'medium' },
                  { label: 'Low Priority (Log Only)', value: 'low' },
                ]}
              />

              <div>
                <label className="block text-[11px] font-medium text-[#8FA8C0] mb-1 uppercase tracking-wider">
                  Case Justification / FIR Reason
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify case reference, FIR number, or reason for monitoring..."
                  className="w-full bg-[#121E2E] border border-[#233A52] rounded-[4px] px-3 py-2 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none focus:border-[#0E7FE0]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#8FA8C0] mb-1 uppercase tracking-wider">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for field interception..."
                  className="w-full bg-[#121E2E] border border-[#233A52] rounded-[4px] px-3 py-2 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none focus:border-[#0E7FE0]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                icon={<Plus className="w-4 h-4" />}
                isLoading={createMutation.isPending}
              >
                Enroll in Watchlist
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
