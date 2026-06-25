import React from 'react';

const Card = ({ children, className = '', hover = false, as: Tag = 'div', ...rest }) => (
  <Tag
    className={
      'bg-white rounded-2xl border border-neutral-200/70 shadow-[var(--shadow-card)] ' +
      (hover ? 'transition-all duration-300 hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5 ' : '') +
      className
    }
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
