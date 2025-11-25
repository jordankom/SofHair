import React from 'react';
import '../../styles/components/_card.scss';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return <div className={`ui-card ${className}`.trim()}>{children}</div>;
};

export default Card;
