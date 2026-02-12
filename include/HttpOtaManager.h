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
    enum class OtaState {
      IDLE,
      CHECKING,
      UPDATING
    };
    typedef void (*OtaStateCallback)(OtaState state);

    HttpOtaManager();
    void checkForUpdates();
    void setStateCallback(OtaStateCallback cb);
  private:
    OtaStateCallback _stateCallback = nullptr;
    void _setState(OtaState state);

    bool _fetchManifest(DynamicJsonDocument& doc);
    void _performUpdate(const String& url, int updateType);
    bool _otaUpdateApp(const String& url);
    bool _otaUpdateFS(const String& url);
};

#endif
