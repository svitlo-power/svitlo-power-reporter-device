#ifndef HTTP_OTA_MANAGER_H
#define HTTP_OTA_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Update.h>
#include <HTTPClient.h>
#include <HTTPUpdate.h>
#include <ArduinoJson.h>
#include "StorageManager.h"

class HttpOtaManager {
  public:
    enum class OtaState {
      IDLE,
      CHECKING,
      UPDATING
    };
    typedef void (*OtaStateCallback)(OtaState state);

    HttpOtaManager(StorageManager& storage);
    void checkForUpdates();
    void setStateCallback(OtaStateCallback cb);
  private:
    OtaStateCallback _stateCallback = nullptr;
    StorageManager& _storageManager;
    void _setState(OtaState state);

    bool _fetchManifest(DynamicJsonDocument& doc);
    void _performUpdate(const String& url, int updateType);
    bool _otaUpdateApp(const String& url);
    bool _otaUpdateFS(const String& url);
};

#endif
