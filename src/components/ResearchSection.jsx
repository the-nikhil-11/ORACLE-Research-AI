import React from 'react';

export default function ResearchSection({ title, children }) {
  if (!children) return null;
  const isEmpty =
    typeof children === 'string' ? !children.trim() :
    Array.isArray(children) ? children.every(c => !c) : false;
  if (isEmpty) return null;

  return (
    <div className="result-section">
      <div className="result-section__header">{title}</div>
      <div className="result-section__body">{children}</div>
    </div>
  );
}
