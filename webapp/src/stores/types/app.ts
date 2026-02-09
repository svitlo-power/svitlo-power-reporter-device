export type AppState = {
  appVer?: string;
  fsVer?: string;
  ssid?: string;
  token?: string;
  loading: boolean;
  currentView: 'main' | 'wifi' | 'token';
}