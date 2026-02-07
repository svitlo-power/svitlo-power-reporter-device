#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <DNSServer.h>
#include "ConfigManager.h"

class WiFiManager {
public:
    WiFiManager(ConfigManager& config);
    void begin();
    void handle();
    bool isConnected();

private:
    ConfigManager& configManager;
    DNSServer dnsServer;
    bool apMode;

    void startAP();
    void startSTA(const String& ssid, const String& password);
};

#endif
