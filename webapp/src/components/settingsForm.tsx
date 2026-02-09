import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Select } from './select';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { scanWifiNetworks, saveWifiConfig, saveTokenConfig, saveAllConfigs, resetDevice } from '../stores/thunks';
import { setCurrentView } from '../stores/slices';

export const SettingsForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { networks, loading: scanning } = useAppSelector(state => state.wifi);
  const { ssid, token, currentView, loading: appLoading } = useAppSelector(state => state.app);

  const [ssidValue, setSsid] = useState(ssid || '');
  const [passwordValue, setPassword] = useState('');
  const [tokenValue, setToken] = useState(token || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ssid) setSsid(ssid);
    if (token) setToken(token);
  }, [ssid, token]);

  useEffect(() => {
    if (currentView === 'wifi' || (!ssid || !token)) {
      dispatch(scanWifiNetworks());
    }
  }, [dispatch, currentView, ssid, token]);

  const handleSaveAll = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await dispatch(saveAllConfigs({ ssid: ssidValue, password: passwordValue, token: tokenValue }));
    setIsSubmitting(false);
  };

  const handleSaveWifi = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await dispatch(saveWifiConfig({ ssid: ssidValue, password: passwordValue }));
    setIsSubmitting(false);
  };

  const handleSaveToken = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await dispatch(saveTokenConfig({ token: tokenValue }));
    setIsSubmitting(false);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the device? All settings will be lost.')) {
      setIsSubmitting(true);
      await dispatch(resetDevice());
      setIsSubmitting(false);
    }
  };

  const wifiOptions = [
    { label: scanning && networks.length === 0 ? 'Scanning...' : 'Select a network...', value: '' },
    ...(ssid && !networks.some(n => n.ssid === ssid) ? [{ label: `${ssid} (Stored)`, value: ssid }] : []),
    ...networks.map(n => ({
      label: `${n.ssid} (${n.rssi} dBm)${n.secure ? ' 🔒' : ''}${n.ssid === ssid ? ' (Stored)' : ''}`,
      value: n.ssid
    }))
  ];

  if (appLoading || isSubmitting) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>{isSubmitting ? 'Saving & Restarting...' : 'Loading...'}</h2>
          <p style={{ color: 'var(--text-dimmed)' }}>
            {isSubmitting ? 'The device is applying changes and will restart momentarily.' : 'Please wait while we fetch the device status.'}
          </p>
        </div>
      </div>
    )
  }

  // Initial Setup View
  if (!ssid || !token) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <form onSubmit={handleSaveAll} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Device Setup</h2>
          <Select label="WiFi Network" options={wifiOptions} value={ssidValue} onChange={(e) => setSsid(e.target.value)} required />
          <Input label="WiFi Password" placeholder="Enter password" type="password" value={passwordValue} onChange={(e) => setPassword(e.target.value)} required />
          <div className="divider" />
          <Input label="Reporter Token" placeholder="Enter your device token" type="text" value={tokenValue} onChange={(e) => setToken(e.target.value)} required />
          <div className="button-stack">
            <button type="submit" className="btn btn-primary" disabled={scanning}>Complete Setup</button>
          </div>
        </form>
      </div>
    );
  }

  // WiFi Update View
  if (currentView === 'wifi') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <form onSubmit={handleSaveWifi} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Change WiFi</h2>
          <Select label="WiFi Network" options={wifiOptions} value={ssidValue} onChange={(e) => setSsid(e.target.value)} required />
          <Input label="WiFi Password" placeholder="Enter password" type="password" value={passwordValue} onChange={(e) => setPassword(e.target.value)} required />
          <div className="button-stack">
            <button type="submit" className="btn btn-primary" disabled={scanning}>Save & Restart</button>
            <button type="button" onClick={() => dispatch(setCurrentView('main'))} className="btn btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  // Token Update View
  if (currentView === 'token') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <form onSubmit={handleSaveToken} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Change Reporter Token</h2>
          <Input label="Reporter Token" placeholder="Enter your device token" type="text" value={tokenValue} onChange={(e) => setToken(e.target.value)} required />
          <div className="button-stack">
            <button type="submit" className="btn btn-primary">Save & Restart</button>
            <button type="button" onClick={() => dispatch(setCurrentView('main'))} className="btn btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  // Main Status View
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Device Status</h2>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-dimmed)', marginBottom: '0.25rem' }}>Selected WiFi</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ssid}</div>
        </div>

        <div className="button-stack">
          <button type="button" onClick={() => dispatch(setCurrentView('wifi'))} className="btn btn-primary">Change WiFi</button>
          <button type="button" onClick={() => dispatch(setCurrentView('token'))} className="btn btn-primary">Change Token</button>
          <div className="divider" style={{ margin: '1rem 0' }} />
          <button type="button" onClick={handleReset} className="btn btn-outline" style={{ color: '#fa5252' }}>Reset Device</button>
        </div>
      </div>
    </div>
  );
};
