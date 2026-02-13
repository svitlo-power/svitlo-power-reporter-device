#include "PingManager.h"
#include "config.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>

PingManager::PingManager(WiFiManager& wifiMgr, StorageManager& storageMgr, ConfigManager& configMgr)
  : _wifiMgr(wifiMgr), _storageMgr(storageMgr), _configMgr(configMgr), _lastPingTime(0) {
}

void PingManager::handle() {
  if (!_wifiMgr.isConnected()) {
    return;
  }

  unsigned long currentMillis = millis();
  if (currentMillis - _lastPingTime >= _pingInterval || _lastPingTime == 0) {
    sendPing();
    _lastPingTime = currentMillis;
  }
}

void PingManager::sendPing() {
  HTTPClient http;
  http.begin(PING_URL);
  http.addHeader("Content-Type", "application/json");

  String token = _configMgr.getReporterToken();
  if (token.length() > 0) {
    http.addHeader("Authorization", "Bearer " + token);
  }

  StaticJsonDocument<200> doc;
  doc["app_version"] = FW_VERSION;
  doc["fs_version"] = _storageMgr.getFSVersion();
  doc["uptime"] = millis() / 1000;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode == HTTP_CODE_OK) {
    Serial.println("[Ping] Ping request sent");
  } else if (httpResponseCode > 0) {
    Serial.printf("[Ping] Ping request failed: %d\n", httpResponseCode);
  } else {
    Serial.printf("[Ping] Ping request failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
