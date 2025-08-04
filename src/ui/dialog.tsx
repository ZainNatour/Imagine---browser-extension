/* istanbul ignore file */
import React from 'react';

interface DialogProps {
  open?: boolean;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open = false, children }) => (open ? <>{children}</> : null);

export const DialogTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }>
  = ({ children, ...props }) => <div {...props}>{children}</div>;

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogClose: React.FC<{ children: React.ReactNode; onClick?: () => void }>
  = ({ children, ...props }) => <div {...props}>{children}</div>;
