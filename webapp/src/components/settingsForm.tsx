import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Select } from './select';
import { ConfirmDialog } from './confirmDialog';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { scanWifiNetworks, saveWifiConfig, saveTokenConfig, saveAllConfigs, resetDevice } from '../stores/thunks';
import { setCurrentView } from '../stores/slices';
import { pollAndRedirect } from '../utils/mdns';

export const SettingsForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { networks, loading: scanning } = useAppSelector(state => state.wifi);
  const { ssid, token, wifiStatus, wifiIp, currentView, loading: appLoading } = useAppSelector(state => state.app);

  const [ssidValue, setSsid] = useState(ssid || '');
  const [passwordValue, setPassword] = useState('');
  const [tokenValue, setToken] = useState(token || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

    dispatch(setCurrentView('connecting'));

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

  const handleSaveWifi = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(saveWifiConfig({ ssid: ssidValue, password: passwordValue }));

    try {
      await pollAndRedirect(window.location.hostname);
    } catch (error) {
      console.error('Failed to redirect to device:', error);
      alert(`WiFi configuration saved, but automatic redirection failed. Please manually navigate to http://${window.location.hostname}`);
    }
  };

  const handleSaveToken = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(saveTokenConfig({ token: tokenValue }));

    try {
      await pollAndRedirect(window.location.hostname);
    } catch (error) {
      console.error('Failed to redirect to device:', error);
      alert(`Token configuration saved, but automatic redirection failed. Please manually navigate to http://${window.location.hostname}`);
    }
  };

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    dispatch(setCurrentView('resetting'));
    await dispatch(resetDevice());
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

  // Connecting View
  if (currentView === 'connecting') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Connecting to Network...</h2>
          <p style={{ color: 'var(--text-dimmed)', marginBottom: '1.5rem' }}>
            The device is connecting to your WiFi network. Please wait while we redirect you to the new address.
          </p>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Resetting View
  if (currentView === 'resetting') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Device Resetting...</h2>
          <p style={{ color: 'var(--text-dimmed)', marginBottom: '1.5rem' }}>
            The device is resetting to factory settings and will restart momentarily.
          </p>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem'
          }} />
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>📡 Next Steps:</div>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-dimmed)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <li>Connect to the <strong style={{ color: 'var(--text-primary)' }}>SvitloPower-Setup</strong> WiFi network</li>
              <li>Your browser should automatically open the setup page</li>
              <li>If not, navigate to <strong style={{ color: 'var(--text-primary)' }}>http://{window.location.hostname}</strong></li>
            </ol>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ssid}</div>
            {wifiStatus && (
              <span style={{
                fontSize: '0.75rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: wifiStatus === 'Connected' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: wifiStatus === 'Connected' ? '#22c55e' : '#ef4444',
                fontWeight: 600,
                border: `1px solid ${wifiStatus === 'Connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {wifiStatus}
              </span>
            )}
          </div>
          {wifiIp && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-dimmed)' }}>
              IP: {wifiIp}
            </div>
          )}
        </div>

        <div className="button-stack">
          <button type="button" onClick={() => dispatch(setCurrentView('wifi'))} className="btn btn-primary">Change WiFi</button>
          <button type="button" onClick={() => dispatch(setCurrentView('token'))} className="btn btn-primary">Change Token</button>
          <div className="divider" style={{ margin: '1rem 0' }} />
          <button type="button" onClick={() => setShowResetConfirm(true)} className="btn btn-outline" style={{ color: '#fa5252' }}>Reset Device</button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Device?"
        message="Are you sure you want to reset the device? All settings will be lost and you will need to reconfigure the device."
        confirmLabel="Reset Device"
        isDangerous
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
