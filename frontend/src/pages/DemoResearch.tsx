import React, { useState } from 'react';
import { Bot, Search } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { demoRequest } from '../api/demoClient';

export default function DemoResearch() {
  const [plate, setPlate] = useState('GJ01AB1234');
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="overview min-h-[calc(100vh-140px)] flex flex-col justify-center max-w-4xl mx-auto w-full py-6">
      <PageHeader
        title="Investigation assistant"
        description="Prepare a review brief from the sample sightings."
      />
      <section className="work-panel search-panel">
        <div className="eyebrow"><Bot size={17} /> DEMONSTRATION ASSISTANT</div>
        <h2>Evidence first.<br /><span>Conclusions reviewed.</span></h2>
        <div className="demo-notice">
          This mode uses a deterministic summary, not an AI provider. It does not query VAHAN, CCTNS, personal records or external intelligence services.
        </div>
        <form
          className="mt-5 flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const result = (await demoRequest('/copilot/analyze', {
                method: 'POST',
                body: JSON.stringify({ plate_text: plate }),
              })) as { analysis: string };
              setSummary(result.analysis);
            } catch {
              setSummary('Could not prepare the sample summary.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="flex-1 min-w-[220px]">
            <Input
              label="Sample registration plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
            />
          </div>
          <Button type="submit" isLoading={busy} icon={<Search size={16} />}>
            Prepare brief
          </Button>
        </form>
      </section>
      {summary && (
        <section className="work-panel search-panel">
          <h3 className="text-lg mb-4">Review brief</h3>
          <p className="whitespace-pre-wrap leading-7 text-sm" role="status">
            {summary}
          </p>
        </section>
      )}
    </div>
  );
}
