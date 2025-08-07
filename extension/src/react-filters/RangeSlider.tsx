import React from 'react';
import { Slider } from '../ui/slider';

type Props = {
  min: number;
  max: number;
  value: number[];
  onChange: (val: number[]) => void;
};

export const RangeSlider: React.FC<Props> = ({ min, max, value, onChange }) => (
  <div className="flex items-center space-x-2">
    <Slider min={min} max={max} value={value} onValueChange={onChange} />
    <span>{`${value[0]} - ${value[1]}`}</span>
  </div>
);
