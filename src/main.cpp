#include <Arduino.h>
#include "time.h"

#include "ConfigManager.h"
#include "WiFiManager.h"
#include "WebServerManager.h"
#include "HttpOtaManager.h"
#include "config.h"

ConfigManager configMgr;
WiFiManager wifiMgr(configMgr);
WebServerManager serverMgr(configMgr, wifiMgr);
HttpOtaManager httpOtaMgr;

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 7200;
const int   daylightOffset_sec = 7200;

void setup() {
  Serial.begin(115200);

  if (!configMgr.begin()) {
    Serial.println("Error initializing Preferences");
  }

  wifiMgr.begin();

  if (wifiMgr.isConnected()) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    httpOtaMgr.checkForUpdates();
  }

  if (!serverMgr.begin()) {
    Serial.println("Error starting WebServer");
  }

  Serial.println("System initialized");
}

void loop() {
  wifiMgr.handle();
}
