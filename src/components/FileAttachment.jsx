import React from 'react';

export default function FileAttachment({ file, state, onRemove }) {
  const name = file?.name || 'file';
  const truncated = name.length > 28 ? name.slice(0, 25) + '...' : name;

  return (
    <span className="chip" role="listitem">
      <span className="chip__name" title={name}>{truncated}</span>
      {state && <span className="chip__state">{state}</span>}
      <button
        type="button"
        className="chip__remove"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
      >
        ×
      </button>
    </span>
  );
}
