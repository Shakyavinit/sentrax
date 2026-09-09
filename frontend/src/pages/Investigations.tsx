import React from 'react';
import { Briefcase } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const Investigations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Case Investigations &amp; Dossiers</h2>
        <p className="text-xs text-slate-400 mt-1">
          Assemble cross-camera timeline evidence, vehicle routes, and court-admissible dossiers.
        </p>
      </div>

      <EmptyState
        icon={Briefcase}
        title="No Active Case Dossiers"
        description="Case folders will group multi-camera sightings, verified SHA-256 evidence frames, and suspect route maps once cases are initiated."
      />
    </div>
  );
};
