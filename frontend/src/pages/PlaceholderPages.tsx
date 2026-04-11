import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{ padding: '2rem', color: 'var(--text-main)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>This section is currently under development. Stay tuned!</p>
    </div>
  );
};

export const Students: React.FC = () => <PlaceholderPage title="Students Management" />;
export const Analytics: React.FC = () => <PlaceholderPage title="Data Analytics" />;
export const Reports: React.FC = () => <PlaceholderPage title="Academic Reports" />;
export const Settings: React.FC = () => <PlaceholderPage title="System Settings" />;
export const Events: React.FC = () => <PlaceholderPage title="College Events" />;
