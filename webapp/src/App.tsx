import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { Footer, Header } from './components'
import { store, useAppDispatch, useAppSelector } from './stores/store'
import { useEffect } from 'react'
import { fetchAppData, scanWifiNetworks } from './stores/thunks';
import { SystemPage } from './pages';
import { AppRouter } from './AppRouter';

function AppComponent() {
  const dispatch = useAppDispatch();
  const { ssid, token, loading, currentView } = useAppSelector(state => state.app);

  useEffect(() => {
    dispatch(fetchAppData());
  }, [dispatch]);

  useEffect(() => {
    if (ssid === '' || token === '') {
      dispatch(scanWifiNetworks());
    }
  }, [dispatch, ssid, token]);

  const showSystemPage = loading || currentView === 'connecting' || currentView === 'resetting';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      <Header name="Svitlo Power Reporter" />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showSystemPage ? <SystemPage /> : <AppRouter />}
      </main>
      <Footer />
    </div>
  );
}

export const App = () => (
  <Provider store={store}>
    <HashRouter>
      <AppComponent />
    </HashRouter>
  </Provider>
);
