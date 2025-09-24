import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const classes = ['card', className].filter(Boolean).join(' ');
  
  return (
    <div 
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  const classes = ['card-header', className].filter(Boolean).join(' ');
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  const classes = ['card-body', className].filter(Boolean).join(' ');
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  const classes = ['card-footer', className].filter(Boolean).join(' ');
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};