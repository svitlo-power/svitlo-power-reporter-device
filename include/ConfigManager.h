#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>

class ConfigManager {
  public:
    ConfigManager();
    bool begin();
    String getWifiSSID();
    String getWifiPassword();
    void setWifiCredentials(const String& ssid, const String& password);
    void clear();

  private:
    Preferences _preferences;
};

#endif
