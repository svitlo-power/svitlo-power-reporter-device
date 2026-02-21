import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/confirmDialog';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { setCurrentView } from '../stores/slices/app';
import { resetDevice } from '../stores/thunks';

export const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { ssid, wifiStatus, wifiIp } = useAppSelector(state => state.app);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    dispatch(setCurrentView('resetting'));
    await dispatch(resetDevice());
    navigate('/system');
  };

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
          <button type="button" onClick={() => navigate('/wifi')} className="btn btn-primary">Change WiFi</button>
          <button type="button" onClick={() => navigate('/token')} className="btn btn-primary">Change Token</button>
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
