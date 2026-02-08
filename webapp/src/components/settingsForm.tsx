import React from 'react';
import { Input } from './input';

export const SettingsForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for save
  };

  const handleReset = () => {
    // Implementation for reset
  };

  return (
    <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
      <form onSubmit={handleSubmit} className="glass-card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Device Configuration</h2>

        <Input
          label="WiFi Network Name"
          placeholder="Select network name"
          type="text"
          required
        />

        <Input
          label="WiFi Password"
          placeholder="Enter password"
          type="password"
          required
        />

        <div className="divider" />

        <Input
          label="Reporter Token"
          placeholder="Enter your device token"
          type="text"
          required
        />

        <div className="button-stack">
          <button type="submit" className="btn btn-primary">Save Settings</button>
          <button type="button" onClick={handleReset} className="btn btn-outline">Reset to Defaults</button>
        </div>
      </form>
    </div>
  );
};
