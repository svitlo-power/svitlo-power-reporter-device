import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './stores/store';
import {
  StatusPage,
  SetupPage,
  WifiPage,
  TokenPage,
  SystemPage
} from './pages';

export const AppRouter: React.FC = () => {
  const { ssid, token } = useAppSelector(state => state.app);
  const isConfigured = ssid && token;

  return (
    <Routes>
      {isConfigured ? (
        <>
          <Route path="/" element={<StatusPage />} />
          <Route path="/wifi" element={<WifiPage />} />
          <Route path="/token" element={<TokenPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </>
      )}
      <Route path="/system" element={<SystemPage />} />
    </Routes>
  );
};
