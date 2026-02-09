import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Select } from './select';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { scanWifiNetworks } from '../stores/thunks';

export const SettingsForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { networks, loading: scanning } = useAppSelector(state => state.wifi);
  const { ssid, token } = useAppSelector(state => state.app);

  const [ssidValue, setSsid] = useState(ssid || '');
  const [passwordValue, setPassword] = useState('');
  const [tokenValue, setToken] = useState(token || '');

  useEffect(() => {
    if (ssid) setSsid(ssid);
    if (token) setToken(token);
  }, [ssid, token]);

  useEffect(() => {
    dispatch(scanWifiNetworks());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  };

  const handleReset = () => {
    setSsid(ssid || '');
    setPassword('');
    setToken(token || '');
  };

  const wifiOptions = [
    { label: scanning && networks.length === 0 ? 'Scanning...' : 'Select a network...', value: '' },
    ...(ssid && !networks.some(n => n.ssid === ssid) ? [{ label: `${ssid} (Stored)`, value: ssid }] : []),
    ...networks.map(n => ({
      label: `${n.ssid} (${n.rssi} dBm)${n.secure ? ' 🔒' : ''}${n.ssid === ssid ? ' (Stored)' : ''}`,
      value: n.ssid
    }))
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <form onSubmit={handleSubmit} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Device Configuration</h2>

        <Select
          label="WiFi Network"
          options={wifiOptions}
          value={ssidValue}
          onChange={(e) => setSsid(e.target.value)}
          required
        />

        <Input
          label="WiFi Password"
          placeholder="Enter password"
          type="password"
          value={passwordValue}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="divider" />

        <Input
          label="Reporter Token"
          placeholder="Enter your device token"
          type="text"
          value={tokenValue}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <div className="button-stack">
          <button type="submit" className="btn btn-primary" disabled={scanning}>Save Settings</button>
          <button type="button" onClick={handleReset} className="btn btn-outline">Reset to Defaults</button>
        </div>
      </form>
    </div>
  );
};
