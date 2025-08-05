import React from 'react';

type Props = {
  label: string;
  active?: boolean;
  onToggle?: (active: boolean) => void;
  onRemove?: () => void;
};

export const FilterChip: React.FC<Props> = ({
  label,
  active = false,
  onToggle,
  onRemove,
}) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle(!active);
    } else if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className="bg-primary text-white px-2 py-1 rounded flex items-center space-x-1 mr-2 mb-2"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onClick={handleClick}
    >
      <span>{label}</span>
      {onRemove && (
        <button aria-label={`Remove ${label}`} className="ml-1 text-white">
          ×
        </button>
      )}
    </span>
  );
};
