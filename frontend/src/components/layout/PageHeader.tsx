import React from 'react';

export const PageHeader: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ actions }) => {
  if (!actions) return null;
  return (
    <div className="flex items-center justify-end gap-2 mb-3">
      {actions}
    </div>
  );
};

