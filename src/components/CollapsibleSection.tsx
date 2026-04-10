import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  hasError,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-lg mb-2 overflow-hidden transition-colors
      ${hasError ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="font-medium text-gray-800">{title}</span>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>
        {hasError && (
          <span className="text-red-500 text-sm">⚠️ 存在错误</span>
        )}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

interface SectionGroupProps {
  title: string;
  children: React.ReactNode;
}

export const SectionGroup: React.FC<SectionGroupProps> = ({ title, children }) => (
  <div className="mb-4 last:mb-0">
    <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
      {title}
    </h4>
    <div className="grid grid-cols-2 gap-3">
      {children}
    </div>
  </div>
);
