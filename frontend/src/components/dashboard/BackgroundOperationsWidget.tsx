import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Activity, 
  Cpu, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Layers,
  Camera,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { systemApi, BackgroundSystemStatus, WorkerStatusItem } from "../../api/system";
import { toast } from "sonner";

export const BackgroundOperationsWidget: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);

  const { data: status, isLoading, refetch } = useQuery<BackgroundSystemStatus>({
    queryKey: ["background-status"],
    queryFn: systemApi.getBackgroundStatus,
    refetchInterval: 12000,
  });

  const triggerMutation = useMutation({
    mutationFn: (workerId: string) => systemApi.triggerWorker(workerId),
    onSuccess: (data) => {
      toast.success(`⚡ ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["background-status"] });
    },
    onError: (err: any) => {
      toast.error(`Execution error: ${err?.message || "Task failed"}`);
    },
    onSettled: () => {
      setActiveTrigger(null);
    }
  });

  const handleTrigger = (workerId: string) => {
    setActiveTrigger(workerId);
    triggerMutation.mutate(workerId);
  };

  const getWorkerIcon = (id: string) => {
    switch (id) {
      case "camera_health": return <Camera size={14} className="text-cyan-400" />;
      case "ai_processing": return <Cpu size={14} className="text-blue-400" />;
      case "anpr_consensus": return <Search size={14} className="text-emerald-400" />;
      case "watchlist_correlation": return <ShieldCheck size={14} className="text-amber-400" />;
      case "cross_camera_correlation": return <Layers size={14} className="text-purple-400" />;
      case "evidence_integrity": return <ShieldCheck size={14} className="text-emerald-400" />;
      case "research_agent_ops": return <Sparkles size={14} className="text-cyan-300" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  const formatLastRun = (iso: string | null) => {
    if (!iso) return "Idle";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="work-panel bg-[#090f17] border border-[#172738] rounded-[10px] p-4 my-3 text-xs">
      <div className="flex items-center justify-between gap-3 border-b border-[#172738] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Cpu size={16} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Background Operations & Asynchronous Workers
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${
                status?.status === "operational" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}>
                {status?.status || "OPERATIONAL"}
              </span>
            </div>
            <p className="text-[#6C8299] text-[11px] font-mono mt-0.5">
              Redis Task Broker · Celery Prefork Engine · Strict Camera Throttling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded bg-[#101b28] hover:bg-[#162538] border border-[#213750] text-[#8FA8C0] text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Worker Telemetry"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>Poll Status</span>
          </button>
        </div>
      </div>

      {/* TOP SYSTEM KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-[11px]">
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded px-3 py-2 flex items-center justify-between">
          <span className="text-[#6C8299] flex items-center gap-1.5">
            <Database size={12} className="text-red-400" /> Redis:
          </span>
          <span className="text-emerald-400 font-bold">CONNECTED</span>
        </div>
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded px-3 py-2 flex items-center justify-between">
          <span className="text-[#6C8299] flex items-center gap-1.5">
            <Activity size={12} className="text-cyan-400" /> Celery Nodes:
          </span>
          <span className="text-cyan-400 font-bold">{status?.celery_workers_online ?? 1} Online</span>
        </div>
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded px-3 py-2 flex items-center justify-between">
          <span className="text-[#6C8299] flex items-center gap-1.5">
            <SlidersHorizontal size={12} className="text-amber-400" /> AI Throttling:
          </span>
          <span className="text-amber-400 font-bold">
            {status?.active_ai_cameras_count ?? 4} / {status?.active_ai_camera_limit ?? 4} Limit
          </span>
        </div>
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded px-3 py-2 flex items-center justify-between">
          <span className="text-[#6C8299] flex items-center gap-1.5">
            <Clock size={12} className="text-purple-400" /> Queue Total:
          </span>
          <span className="text-purple-300 font-bold">
            {Object.values(status?.queues || {}).reduce((a, b) => a + b, 0)} Jobs
          </span>
        </div>
      </div>

      {/* 7 WORKERS STATUS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {(status?.workers || []).map((w: WorkerStatusItem) => {
          const isPending = activeTrigger === w.id;
          const isFailed = w.status === "failed";
          const isRunning = w.status === "running" || isPending;

          return (
            <div 
              key={w.id} 
              className="bg-[#0b131e] border border-[#1a2c40] hover:border-[#223d5a] rounded-lg p-2.5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {getWorkerIcon(w.id)}
                    <span className="font-semibold text-[#D1E0EE] text-[11px] truncate" title={w.name}>
                      {w.name}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                    isFailed 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : isRunning
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {isRunning ? "Running" : w.status}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-[#6A8299] flex items-center justify-between mb-2">
                  <span>Last: {formatLastRun(w.last_run)}</span>
                  <span className="text-[#8FA8C0]">✓ {w.success_count}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#142334] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#546b80]">
                  {w.id.replace(/_/g, " ")}
                </span>
                <button
                  onClick={() => handleTrigger(w.id)}
                  disabled={isRunning}
                  className="px-2 py-1 rounded bg-[#132233] hover:bg-[#1a304a] text-cyan-400 hover:text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  title={`Trigger ${w.name}`}
                >
                  <Play size={10} className="fill-current" />
                  <span>{isRunning ? "Queueing..." : "Run"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
