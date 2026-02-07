#include "ConfigManager.h"

ConfigManager::ConfigManager() {}

bool ConfigManager::begin() {
    return preferences.begin("wifi", false);
}

String ConfigManager::getWifiSSID() {
    return preferences.getString("ssid", "");
}

String ConfigManager::getWifiPassword() {
    return preferences.getString("password", "");
}

void ConfigManager::setWifiCredentials(const String& ssid, const String& password) {
    preferences.putString("ssid", ssid);
    preferences.putString("password", password);
}

void ConfigManager::clear() {
    preferences.clear();
}
