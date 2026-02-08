#include "ConfigManager.h"

ConfigManager::ConfigManager() {}

bool ConfigManager::begin() {
  return _preferences.begin("wifi", false);
}

String ConfigManager::getWifiSSID() {
  return _preferences.getString("ssid", "");
}

String ConfigManager::getWifiPassword() {
  return _preferences.getString("password", "");
}

void ConfigManager::setWifiCredentials(const String& ssid, const String& password) {
  _preferences.putString("ssid", ssid);
  _preferences.putString("password", password);
}

void ConfigManager::clear() {
  _preferences.clear();
}
