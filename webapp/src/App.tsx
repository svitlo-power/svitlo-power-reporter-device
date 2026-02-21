import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { store, useAppDispatch, useAppSelector } from './stores/store'
import { fetchAppData, scanWifiNetworks } from './stores/thunks';
import { SystemPage } from './pages';
import { AppRouter } from './AppRouter';
import { MainLayout } from './components'

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
    <MainLayout>
      {showSystemPage ? <SystemPage /> : <AppRouter />}
    </MainLayout>
  );
}

export const App = () => (
  <Provider store={store}>
    <HashRouter>
      <AppComponent />
    </HashRouter>
  </Provider>
);
