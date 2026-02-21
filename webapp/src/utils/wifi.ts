import type { WifiNetwork } from '../stores/types';

export const getWifiOptions = (scanning: boolean, networks: WifiNetwork[], ssid: string | undefined) => [
  { label: scanning && networks.length === 0 ? 'Scanning...' : 'Select a network...', value: '', disabled: true },
  ...(ssid && !networks.some(n => n.ssid === ssid) ? [{ label: `${ssid} (Stored)`, value: ssid }] : []),
  ...networks.map(n => ({
    label: `${n.ssid} (${n.rssi} dBm)${n.secure ? ' 🔒' : ''}${n.ssid === ssid ? ' (Stored)' : ''}`,
    value: n.ssid
  }))
];
