import React from 'react';

type Props = {
  label: string;
  onRemove: () => void;
};

export const FilterChip: React.FC<Props> = ({ label, onRemove }) => (
  <span className="bg-primary text-white px-2 py-1 rounded flex items-center space-x-1 mr-2 mb-2" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onRemove()} onClick={onRemove}>
    <span>{label}</span>
    <button aria-label={`Remove ${label}`} className="ml-1 text-white">×</button>
  </span>
);
