import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../stores/store';
import { ConfirmDialog, Card } from '../components';

export const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { ssid, wifiStatus, wifiIp } = useAppSelector(state => state.app);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <Card title="Status">
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
      </Card>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Device?"
        message={"This will wipe all settings and restart " +
          "the device into setup mode. Are you sure?"}
        isDangerous
        confirmLabel='Reset device'
        onConfirm={async () => {
          const { resetDevice } = await import('../stores/thunks');
          const thunk = resetDevice();
          const { store } = await import('../stores/store');
          store.dispatch(thunk as any);
          navigate('/system');
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
};
