import { Provider } from 'react-redux'
import { Header, SettingsForm } from './components'
import { store, useAppDispatch } from './stores/store'
import { useEffect } from 'react'
import { fetchAppData } from './stores/thunks';

function AppComponent() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchAppData());
  }, []);

  return (
    <Provider store={store}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg)'
      }}>
        <Header name="Svitlo Power Reporter" />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <SettingsForm />
        </main>
        <footer style={{
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-dimmed)',
          fontSize: '0.875rem'
        }}>
          &copy; {new Date().getFullYear()} Svitlo Power. All rights reserved.
        </footer>
      </div>
    </Provider>
  )
}

export const App = () => <Provider store={store}><AppComponent /></Provider>
