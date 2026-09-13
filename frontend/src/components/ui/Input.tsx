import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-medium text-[#8FA8C0] mb-1 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#4D6B85] pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#121E2E] border border-[#233A52] rounded-[4px] px-3 py-2 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none focus:border-[#0E7FE0] focus:ring-1 focus:ring-[#0E7FE0] transition-colors ${
              icon ? 'pl-9' : ''
            } ${error ? 'border-[#FF3B3B]' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-[#FF3B3B] mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
