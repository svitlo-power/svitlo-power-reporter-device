import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Input, TextArea, Select, FormCard } from '../components';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { saveAllConfigs, scanWifiNetworks } from '../stores/thunks';
import { setCurrentView } from '../stores/slices/app';
import { pollAndRedirect, getWifiOptions } from '../utils';
import { useNavigate } from 'react-router-dom';

export const SetupPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { networks, loading: scanning } = useAppSelector(state => state.wifi);
  const { ssid, token } = useAppSelector(state => state.app);

  const [ssidValue, setSsid] = useState(ssid || '');
  const [passwordValue, setPassword] = useState('');
  const [tokenValue, setToken] = useState(token || '');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenUser, setTokenUser] = useState<string | null>(null);

  useEffect(() => {
    dispatch(scanWifiNetworks());
  }, [dispatch]);

  useEffect(() => {
    if (!tokenValue) {
      setTokenError(null);
      setTokenUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<{ sub?: string }>(tokenValue);
      setTokenUser(decoded.sub || 'Unknown');
      setTokenError(null);
    } catch {
      setTokenUser(null);
      setTokenError('Invalid token format');
    }
  }, [tokenValue]);

  const handleSaveAll = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(setCurrentView('connecting'));
    navigate('/system');

    dispatch(saveAllConfigs({
      ssid: ssidValue,
      password: passwordValue,
      token: tokenValue,
    }));

    try {
      await pollAndRedirect(window.location.hostname);
    } catch (error) {
      console.error('Failed to redirect to device:', error);
      alert(`Device configuration saved, but automatic redirection failed. Please manually navigate to http://${window.location.hostname}`);
    }
  };

  const wifiOptions = getWifiOptions(scanning, networks, ssid);

  return (
    <FormCard title="Device Setup" onSubmit={handleSaveAll}>
      <Select label="WiFi Network" options={wifiOptions} value={ssidValue} onChange={(e) => setSsid(e.target.value)} required />
      <Input label="WiFi Password" placeholder="Enter password" type="password" value={passwordValue} onChange={(e) => setPassword(e.target.value)} required />
      <div className="divider" />
      <TextArea label="Reporter Token" placeholder="Enter your device token" rows={5} value={tokenValue} onChange={(e) => setToken(e.target.value)} required />
      {tokenError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{tokenError}</div>}
      {tokenUser && !tokenError && <div style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>User: {tokenUser}</div>}
      <div className="button-stack">
        <button type="submit" className="btn btn-primary" disabled={scanning || !!tokenError || !ssidValue || !passwordValue || !tokenValue}>Complete Setup</button>
      </div>
    </FormCard>
  );
};
