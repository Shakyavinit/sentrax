import React from 'react';
export const PageHeader: React.FC<{title: string; description?: string; actions?: React.ReactNode}> = ({title,description,actions}) => <div className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
