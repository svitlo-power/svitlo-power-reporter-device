import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, FormCard } from '../components';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { scanWifiNetworks, saveWifiConfig } from '../stores/thunks';
import { setCurrentView } from '../stores/slices/app';
import { pollAndRedirect, getWifiOptions } from '../utils';

export const WifiPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { networks, loading: scanning } = useAppSelector(state => state.wifi);
  const { ssid } = useAppSelector(state => state.app);

  useEffect(() => {
    dispatch(scanWifiNetworks());
  }, [dispatch]);

  const [ssidValue, setSsid] = useState(ssid || '');
  const [passwordValue, setPassword] = useState('');

  const handleSaveWifi = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(setCurrentView('connecting'));
    navigate('/system');

    dispatch(saveWifiConfig({ ssid: ssidValue, password: passwordValue }));

    try {
      await pollAndRedirect(window.location.hostname);
    } catch (error) {
      console.error('Failed to redirect to device:', error);
      alert(`WiFi configuration saved, but automatic redirection failed. Please manually navigate to http://${window.location.hostname}`);
    }
  };

  const wifiOptions = getWifiOptions(scanning, networks, ssid);

  return (
    <FormCard title="Change WiFi" onSubmit={handleSaveWifi}>
      <Select label="WiFi Network" options={wifiOptions} value={ssidValue} onChange={(e) => setSsid(e.target.value)} required />
      <Input label="WiFi Password" placeholder="Enter password" type="password" value={passwordValue} onChange={(e) => setPassword(e.target.value)} required />
      <div className="button-stack">
        <button type="submit" className="btn btn-primary" disabled={scanning || !ssidValue || !passwordValue}>Save & Restart</button>
        <button type="button" onClick={() => navigate('/')} className="btn btn-outline">Cancel</button>
      </div>
    </FormCard>
  );
};
