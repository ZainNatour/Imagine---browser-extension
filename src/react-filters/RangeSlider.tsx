import React from 'react';

type Props = {
  min: number;
  max: number;
  value: number[];
  onChange: (val: number[]) => void;
};

export const RangeSlider: React.FC<Props> = ({ min, max, value, onChange }) => (
  <div className="flex items-center space-x-2">
    <input
      type="range"
      min={min}
      max={max}
      value={value[0]}
      onChange={(e) => onChange([Number(e.target.value), value[1]])}
      className="flex-1"
    />
    <input
      type="range"
      min={min}
      max={max}
      value={value[1]}
      onChange={(e) => onChange([value[0], Number(e.target.value)])}
      className="flex-1"
    />
    <span>{`${value[0]} - ${value[1]}`}</span>
  </div>
);
