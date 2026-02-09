export type AppState = {
  appVer?: string;
  fsVer?: string;
  ssid?: string;
  token?: string;
  wifiStatus?: string;
  wifiIp?: string;
  loading: boolean;
  currentView: 'main' | 'wifi' | 'token';
}