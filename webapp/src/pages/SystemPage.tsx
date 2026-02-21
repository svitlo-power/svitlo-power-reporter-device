import React, { useEffect } from 'react';
import { useAppSelector } from '../stores/store';
import { useNavigate } from 'react-router-dom';

export const SystemPage: React.FC = () => {
  const { currentView, loading } = useAppSelector(state => state.app);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentView !== 'connecting' && currentView !== 'resetting') {
      navigate('/', { replace: true });
    }
  }, [loading, currentView, navigate]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Loading...</h2>
          <p style={{ color: 'var(--text-dimmed)' }}>
            Please wait while we fetch the device status.
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'connecting') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Connecting to Network...</h2>
          <p style={{ color: 'var(--text-dimmed)', marginBottom: '1.5rem' }}>
            The device is connecting to your WiFi network. Please wait while we redirect you to the new address.
          </p>
          <div className="spinner" />
          <style>{`
            .spinner {
              display: inline-block;
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.1);
              border-top-color: var(--primary);
              borderRadius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (currentView === 'resetting') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Device Resetting...</h2>
          <p style={{ color: 'var(--text-dimmed)', marginBottom: '1.5rem' }}>
            The device is resetting to factory settings and will restart momentarily.
          </p>
          <div className="spinner" style={{ marginBottom: '1.5rem' }} />
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
            .spinner {
              display: inline-block;
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.1);
              border-top-color: var(--primary);
              borderRadius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
};
