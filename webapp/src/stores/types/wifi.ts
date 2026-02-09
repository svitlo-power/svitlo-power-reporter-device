export type WifiNetwork = {
  ssid: string;
  rssi: number;
  secure: boolean;
};

export type WifiState = {
  networks: WifiNetwork[];
  loading: boolean;
  error: string | null;
};
