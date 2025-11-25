import React from 'react';
import '../../styles/components/_button.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           fullWidth = false,
                                           className = '',
                                           ...rest
                                       }) => {
    const classes = [
        'ui-button',
        `ui-button--${variant}`,
        fullWidth ? 'ui-button--full' : '',
        className
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
};

export default Button;
