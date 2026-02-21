import React, { useEffect } from 'react';
import { useAppSelector } from '../stores/store';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components';

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
      <Card title="Loading..." style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dimmed)' }}>
          Please wait while we fetch the device status.
        </p>
      </Card>
    );
  }

  if (currentView === 'connecting') {
    return (
      <Card title="Connecting to Network..." style={{ textAlign: 'center' }}>
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
      </Card>
    );
  }

  if (currentView === 'resetting') {
    return (
      <Card title="Device Resetting..." style={{ textAlign: 'center', maxWidth: '500px' }}>
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
      </Card>
    );
  }

  return null;
};
