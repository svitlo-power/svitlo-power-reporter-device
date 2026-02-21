import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { TextArea, FormCard } from '../components';
import { useAppDispatch, useAppSelector } from '../stores/store';
import { saveTokenConfig } from '../stores/thunks';
import { setCurrentView } from '../stores/slices/app';
import { pollAndRedirect } from '../utils';

export const TokenPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.app);

  const [tokenValue, setToken] = useState(token || '');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenUser, setTokenUser] = useState<string | null>(null);

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

  const handleSaveToken = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(setCurrentView('connecting'));
    navigate('/system');

    dispatch(saveTokenConfig({ token: tokenValue }));

    try {
      await pollAndRedirect(window.location.hostname);
    } catch (error) {
      console.error('Failed to redirect to device:', error);
      alert(`Token configuration saved, but automatic redirection failed. Please manually navigate to http://${window.location.hostname}`);
    }
  };

  return (
    <FormCard title="Change Reporter Token" onSubmit={handleSaveToken}>
      <TextArea label="Reporter Token" placeholder="Enter your device token" rows={8} value={tokenValue} onChange={(e) => setToken(e.target.value)} required />
      {tokenError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>{tokenError}</div>}
      {tokenUser && !tokenError && <div style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>User: {tokenUser}</div>}
      <div className="button-stack">
        <button type="submit" className="btn btn-primary" disabled={!!tokenError || !tokenValue}>Save & Restart</button>
        <button type="button" onClick={() => navigate('/')} className="btn btn-outline">Cancel</button>
      </div>
    </FormCard>
  );
};
