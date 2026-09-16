import React from 'react';

export interface AuthoringButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary';
}

// This flow's own blue (#1f6aac) doesn't match the shared Button component's
// primary (#0359d1) — kept local so every accent in the modal reads as one
// consistent palette, matching the Figma file's token set for this screen.
export function AuthoringButton({ variant = 'primary', style, disabled, ...props }: AuthoringButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
    padding: '5px 15px',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Open Sans', sans-serif",
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { backgroundColor: '#1f6aac', border: '1px solid #1f6aac', color: 'white', boxShadow: '0px 1px 1.5px rgba(35,80,155,0.4)' }
      : variant === 'secondary'
      ? { backgroundColor: '#edf5fb', border: '1px solid #1f6aac', color: '#1f6aac', boxShadow: '0px 1px 1.5px rgba(35,80,155,0.4)' }
      : { backgroundColor: 'white', border: '1px solid #d2e5f6', color: '#1f6aac', boxShadow: '0px 1px 1.5px rgba(133,133,133,0.3)' };

  return <button {...props} disabled={disabled} style={{ ...base, ...variantStyle, ...style }} />;
}

export default AuthoringButton;
