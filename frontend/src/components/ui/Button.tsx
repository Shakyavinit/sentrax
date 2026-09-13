import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#0E7FE0] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#0E7FE0] hover:bg-[#1A9FFF] active:bg-[#0A4F8C] text-white shadow-[0_0_12px_rgba(14,127,224,0.15)]',
    danger: 'bg-[#FF3B3B] hover:bg-[#D32F2F] active:bg-[#B71C1C] text-white shadow-[0_0_12px_rgba(255,59,59,0.2)]',
    ghost: 'bg-transparent hover:bg-[#121E2E] text-[#8FA8C0] hover:text-[#E8EFF7] border border-[#233A52]',
    secondary: 'bg-[#121E2E] hover:bg-[#1A2A3D] text-[#E8EFF7] border border-[#233A52]',
  };

  const sizes = {
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-4 text-xs gap-2',
    lg: 'h-11 px-6 text-sm gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
