import React from 'react';

const Button = ({
    variant = 'primary',
    className = '',
    type = 'button',
    children,
    ...props
}) => {
    const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary';
    const classes = ['btn', variantClass, className].filter(Boolean).join(' ');

    return (
        <button type={type} className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;
