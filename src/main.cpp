#include <Arduino.h>
#include <ArduinoJson.h>
#include <ArduinoOTA.h>
#include <esp_wifi.h>
#include <WiFi.h>
#include <LittleFS.h>
#include "time.h"

#include "ConfigManager.h"
#include "WiFiManager.h"
#include "WebServerManager.h"

ConfigManager configMgr;
WiFiManager wifiMgr(configMgr);
WebServerManager serverMgr(configMgr);

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 7200;
const int   daylightOffset_sec = 7200;

void setup_ota() {
  ArduinoOTA
    .onStart([]() {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH) {
        type = "sketch";
      } else {
        type = "filesystem";
      }
    });
  ArduinoOTA.begin();
  Serial.println("OTA initialized");
}

void setup() {
  Serial.begin(115200);

  if (!configMgr.begin()) {
    Serial.println("Error initializing Preferences");
  }

  wifiMgr.begin();
  
  if (wifiMgr.isConnected()) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    setup_ota();
  }

  if (!serverMgr.begin()) {
    Serial.println("Error starting WebServer");
  }

  Serial.println("System initialized");
}

void loop() {
  wifiMgr.handle();
  if (wifiMgr.isConnected()) {
    ArduinoOTA.handle();
  }
}
