#ifndef WEB_SERVER_MANAGER_H
#define WEB_SERVER_MANAGER_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include "ConfigManager.h"

class WebServerManager {
public:
    WebServerManager(ConfigManager& config);
    bool begin();
    void stop();

private:
    AsyncWebServer server;
    ConfigManager& configManager;

    void setupRoutes();
};

#endif
