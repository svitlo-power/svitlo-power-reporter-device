#include "WebServerManager.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include "config.h"

WebServerManager::WebServerManager(ConfigManager& config, WiFiManager& wifi) : server(80), configManager(config), wifiManager(wifi) {}

bool WebServerManager::begin() {
  if (!LittleFS.begin(false, "/littlefs", 20, "littlefs")) {
    Serial.println("[Web] Error initializing LittleFS");
    return false;
  }

  _setupRoutes();
  server.begin();
  MDNS.addService("http", "tcp", 80);
  MDNS.setInstanceName(MDNS_HOSTNAME);
  return true;
}

void WebServerManager::stop() {
  server.end();
}

void WebServerManager::_setupRoutes() {
  server.on("/api/app/config", HTTP_GET, [this](AsyncWebServerRequest *request) {
    StaticJsonDocument<256> doc;
    doc["appVer"] = FW_VERSION;
    doc["fsVer"] = FS_VERSION;
    doc["ssid"] = configManager.getWifiSSID();
    doc["token"] = configManager.getReporterToken();
    doc["wifiStatus"] = wifiManager.getStatus();
    doc["wifiIp"] = wifiManager.getIP();
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });

  server.on("/api/app/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, 
    [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, data, len);

      if (error) {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Invalid JSON\"}");
        return;
      }

      String ssid = doc["ssid"];
      String password = doc["password"];
      String token = doc["token"];

      if (ssid.length() > 0 && token.length() > 0) {
        configManager.setWifiCredentials(ssid, password);
        configManager.setReporterToken(token);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
        wifiManager.reconfigure();
      } else {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"SSID and Token are required\"}");
      }
  });

  server.on("/api/wifi/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, 
    [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, data, len);

      if (error) {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Invalid JSON\"}");
        return;
      }

      String ssid = doc["ssid"];
      String password = doc["password"];

      if (ssid.length() > 0) {
        configManager.setWifiCredentials(ssid, password);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
        wifiManager.reconfigure();
      } else {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"SSID is required\"}");
      }
  });

  server.on("/api/token/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, 
    [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<128> doc;
      DeserializationError error = deserializeJson(doc, data, len);

      if (error) {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Invalid JSON\"}");
        return;
      }

      String token = doc["token"];

      if (token.length() > 0) {
        configManager.setReporterToken(token);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
        delay(500);
        ESP.restart();
      } else {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Token is required\"}");
      }
  });

  server.on("/api/reset", HTTP_POST, [this](AsyncWebServerRequest *request) {
    configManager.clear();
    request->send(200, "application/json", "{\"status\":\"ok\"}");
    delay(500);
    ESP.restart();
  });

  server.on("/api/wifi/list", HTTP_GET, [this](AsyncWebServerRequest* request) {
    int n = wifiManager.getScanStatus();
    
    if (n == -2) {
      wifiManager.requestScan();
      request->send(202, "application/json", "{\"status\":\"scanning\"}");
    } else if (n == -1) {
      request->send(202, "application/json", "{\"status\":\"scanning\"}");
    } else {
      DynamicJsonDocument doc = wifiManager.getScanResults();
      String response;
      serializeJson(doc, response);
      request->send(200, "application/json", response);
    }
  });

  server.on("/api/ping", HTTP_GET, [this](AsyncWebServerRequest* request) {
    request->send(200, "application/json", "{\"status\":\"ok\"}");
  });

  String redirectUrl = "http://" + String(MDNS_HOSTNAME) + ".local/";
  
  server.on("/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/connecttest.txt", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/success.txt", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/connectivitycheck.android.com/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/clients3.google.com/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/connectivitycheck.gstatic.com/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  server.on("/hotspot-detect.html", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/canonical.html", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  server.on("/library/test/success.html", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  server.on("/ncsi.txt", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  server.on("/wpad.dat", [](AsyncWebServerRequest *request) { request->send(404); });
  server.on("/redirect", [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  server.onNotFound([this](AsyncWebServerRequest *request) {
    String path = request->url();
    if (path.endsWith("/")) path += "index.html";

    String gzPath = path + ".gz";
    if (LittleFS.exists(gzPath)) {
      String contentType = "text/plain";
      if (path.endsWith(".html")) contentType = "text/html";
      else if (path.endsWith(".css")) contentType = "text/css";
      else if (path.endsWith(".js")) contentType = "application/javascript";
      else if (path.endsWith(".json")) contentType = "application/json";
      else if (path.endsWith(".png")) contentType = "image/png";
      else if (path.endsWith(".svg")) contentType = "image/svg+xml";
      else if (path.endsWith(".ico")) contentType = "image/x-icon";
      else if (path.endsWith(".webp")) contentType = "image/webp";

      AsyncWebServerResponse *response = request->beginResponse(LittleFS, gzPath, contentType);
      response->addHeader("Content-Encoding", "gzip");
      request->send(response);
      return;
    }

    String host = request->host();
    int portIndex = host.indexOf(':');
    if (portIndex != -1) {
      host = host.substring(0, portIndex);
    }

    if (host != "192.168.4.1" && host != String(MDNS_HOSTNAME) + ".local") {
      Serial.println("[Web] Captive Portal Redirect: " + request->url() + " Host: " + host);
      request->redirect("http://" + String(MDNS_HOSTNAME) + ".local/");
    } else {
      request->send(404, "text/plain", "Not Found");
    }
  });
}
