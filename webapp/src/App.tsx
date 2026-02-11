import { Provider } from 'react-redux'
import { Footer, Header, SettingsForm } from './components'
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
        <Footer />
      </div>
    </Provider>
  )
}


export const App = () => <Provider store={store}><AppComponent /></Provider>
