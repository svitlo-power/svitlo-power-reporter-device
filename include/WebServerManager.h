#ifndef WEB_SERVER_MANAGER_H
#define WEB_SERVER_MANAGER_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include "ConfigManager.h"
#include "WiFiManager.h"

class WebServerManager {
  public:
    WebServerManager(ConfigManager& config, WiFiManager& wifi);
    bool begin();
    void stop();

  private:
    AsyncWebServer server;
    ConfigManager& configManager;
    WiFiManager& wifiManager;
    void _setupRoutes();
};

#endif
