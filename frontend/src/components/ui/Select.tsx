import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-medium text-[#8FA8C0] mb-1 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-[#121E2E] border border-[#233A52] rounded-[4px] px-3 py-2 text-xs text-[#E8EFF7] focus:outline-none focus:border-[#0E7FE0] focus:ring-1 focus:ring-[#0E7FE0] transition-colors ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0D1520] text-[#E8EFF7]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-[#FF3B3B] mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
