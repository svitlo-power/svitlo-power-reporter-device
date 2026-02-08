#ifndef HTTPS_OTA_MANAGER_H
#define HTTPS_OTA_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Update.h>
#include <HTTPClient.h>
#include <HTTPUpdate.h>
#include <ArduinoJson.h>

class HttpOtaManager {
  public:
    HttpOtaManager();
    void checkForUpdates();

  private:
    bool _fetchManifest(DynamicJsonDocument& doc);
    void _performUpdate(const String& url, int updateType);
    bool _otaUpdateApp(const String& url);
    bool _otaUpdateFS(const String& url);
};

#endif
