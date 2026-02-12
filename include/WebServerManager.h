#ifndef WEB_SERVER_MANAGER_H
#define WEB_SERVER_MANAGER_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <ESPmDNS.h>
#include "ConfigManager.h"
#include "WiFiManager.h"
#include "StorageManager.h"

class WebServerManager {
  public:
    WebServerManager(ConfigManager& config, WiFiManager& wifi, StorageManager& storage);
    bool begin();
    void stop();

  private:
    AsyncWebServer _server;
    ConfigManager& _configManager;
    WiFiManager& _wifiManager;
    StorageManager& _storageManager;
    void _setupRoutes();
    String _getContentType(const String& path);
};

#endif
