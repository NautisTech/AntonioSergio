import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  name, 
  size = 50, 
  className = '',
  style = {}
}) => {
  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    ...style
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={className}
        style={{
          ...avatarStyle,
          objectFit: 'cover' as const
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        ...avatarStyle,
        backgroundColor: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '500',
        fontSize: `${Math.max(size * 0.36, 12)}px`
      }}
    >
      {name.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
};