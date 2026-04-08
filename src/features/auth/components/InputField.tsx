import React from 'react';
import type { InputFieldProps } from '@/features/auth/types';

const InputField: React.FC<InputFieldProps> = ({ icon: Icon, error, className, ...props }) => (
  <div className="w-full">
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Icon className={`w-4 h-4 transition-all duration-200 ${error
          ? 'text-red-600'
          : 'text-stone-400 group-focus-within:text-teal-700'
          }`} />
      </div>
      <input
        {...props}
        className={`w-full pl-11 pr-4 py-3 bg-white border text-stone-900 placeholder:text-stone-400 text-sm font-medium rounded-xl transition-all duration-200 outline-none ${error
          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
          : 'border-stone-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 hover:border-stone-300'
          } ${className}`}
      />
    </div>
    {error && (
      <p className="mt-2 ml-1 text-xs text-red-600 font-semibold flex items-center gap-1.5">
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="6" cy="6" r="6" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

export default InputField;