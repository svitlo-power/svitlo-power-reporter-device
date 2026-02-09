#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
#include "ConfigManager.h"

class WiFiManager {
  public:
    WiFiManager(ConfigManager& config);
    void begin();
    void handle();
    bool isConnected();
    String getIP();
    String getStatus();
    bool isAPMode();
    void requestScan();
    int getScanStatus(); 
    DynamicJsonDocument getScanResults();

  private:
    ConfigManager& configManager;
    DNSServer dnsServer;
    bool _apMode;
    bool _scanRequested;

    void _startAP();
    void _startSTA(const String& ssid, const String& password);
};

#endif
