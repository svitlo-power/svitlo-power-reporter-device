#include <Arduino.h>
#include "time.h"

#include "ConfigManager.h"
#include "WiFiManager.h"
#include "WebServerManager.h"
#include "HttpOtaManager.h"
#include "LedManager.h"
#include "config.h"

ConfigManager configMgr;
StorageManager storageMgr;
WiFiManager wifiMgr(configMgr);
WebServerManager serverMgr(configMgr, wifiMgr, storageMgr);
HttpOtaManager httpOtaMgr(storageMgr);
LedManager ledMgr(STATUS_LED_PIN, true);

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 7200;
const int   daylightOffset_sec = 7200;

LedManager::Mode prev_led_mode;

void onOtaStateChanged(HttpOtaManager::OtaState state) {
  switch (state) {
    case HttpOtaManager::OtaState::CHECKING:
    case HttpOtaManager::OtaState::UPDATING: {
        LedManager::Mode led_mode = ledMgr.getMode();
        if (led_mode != LedManager::MODE_OTA) {
          prev_led_mode = led_mode;
        }
        ledMgr.setMode(LedManager::MODE_OTA);
      }
      break;

    case HttpOtaManager::OtaState::IDLE:
    default:
      ledMgr.setMode(prev_led_mode);
      break;
  }
}

void setup() {
  Serial.begin(115200);
  ledMgr.begin();

  if (!storageMgr.begin()) {
    Serial.println("[Main] Cannot initialize storage. Exiting.");
    while(true) delay(500);
  }

  if (!configMgr.begin()) {
    Serial.println("[Main] Error initializing Preferences");
  }

  httpOtaMgr.setStateCallback(onOtaStateChanged);
  wifiMgr.begin();

  if (!serverMgr.begin()) {
    Serial.println("[Main] Error starting WebServer");
  }

  Serial.println("[Main] System initialized");
}

void loop() {
  wifiMgr.handle();
  ledMgr.handle();

  if (wifiMgr.isAPMode()) {
    ledMgr.setMode(LedManager::MODE_AP);
  } else if (wifiMgr.isConnected()) {
    ledMgr.setMode(LedManager::MODE_STA);
  } else {
    ledMgr.setMode(LedManager::MODE_OFF);
  }

  static bool initialConfigDone = false;
  if (wifiMgr.isConnected() && !initialConfigDone) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    httpOtaMgr.checkForUpdates();
    initialConfigDone = true;
    Serial.println("[Main] Startup complete.");
  }
}
