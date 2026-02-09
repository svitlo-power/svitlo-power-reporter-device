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

String ConfigManager::getReporterToken() {
  return _preferences.getString("token", "");
}

void ConfigManager::setWifiCredentials(const String& ssid, const String& password) {
  _preferences.putString("ssid", ssid);
  _preferences.putString("password", password);
}

void ConfigManager::setReporterToken(const String& token) {
  _preferences.putString("token", token);
}

void ConfigManager::clear() {
  _preferences.clear();
}
