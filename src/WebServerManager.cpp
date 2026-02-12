#include "WebServerManager.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include "config.h"

WebServerManager::WebServerManager(ConfigManager& config, WiFiManager& wifi, StorageManager& storage)
  : _server(80), _configManager(config), _wifiManager(wifi), _storageManager(storage) {}

bool WebServerManager::begin() {
  _setupRoutes();
  _server.begin();
  MDNS.addService("http", "tcp", 80);
  MDNS.setInstanceName(MDNS_HOSTNAME);
  return true;
}

void WebServerManager::stop() {
  _server.end();
}

String WebServerManager::_getContentType(const String& path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css"))  return "text/css";
  if (path.endsWith(".js"))   return "application/javascript";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".png"))  return "image/png";
  if (path.endsWith(".svg"))  return "image/svg+xml";
  if (path.endsWith(".ico"))  return "image/x-icon";
  if (path.endsWith(".webp")) return "image/webp";
  return "text/plain";
}

void WebServerManager::_setupRoutes() {
  _server.on("/api/app/config", HTTP_GET, [this](AsyncWebServerRequest *request) {
    StaticJsonDocument<512> doc;
    doc["appVer"] = FW_VERSION;
    doc["fsVer"] = _storageManager.getFSVersion();
    doc["ssid"] = _configManager.getWifiSSID();
    doc["token"] = _configManager.getReporterToken();
    doc["wifiStatus"] = _wifiManager.getStatus();
    doc["wifiIp"] = _wifiManager.getIP();
    doc["uptime"] = (ulong)(millis() / 1000);
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });

  _server.on("/api/app/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, 
    [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, data, len);

      if (error) {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Invalid JSON\"}");
        return;
      }

      String ssid = doc["ssid"];
      String password = doc["password"];
      String token = doc["token"];

      if (ssid.length() > 0 && token.length() > 0) {
        _configManager.setWifiCredentials(ssid, password);
        _configManager.setReporterToken(token);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
        _wifiManager.reconfigure();
      } else {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"SSID and Token are required\"}");
      }
  });

  _server.on("/api/wifi/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, 
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
        _configManager.setWifiCredentials(ssid, password);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
        _wifiManager.reconfigure();
      } else {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"SSID is required\"}");
      }
  });

  _server.on("/api/token/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, 
    [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, data, len);

      if (error) {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Invalid JSON\"}");
        return;
      }

      String token = doc["token"];

      if (token.length() > 0) {
        _configManager.setReporterToken(token);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
        delay(500);
        ESP.restart();
      } else {
        request->send(400, "application/json", "{\"status\":\"error\", \"message\":\"Token is required\"}");
      }
  });

  _server.on("/api/reset", HTTP_POST, [this](AsyncWebServerRequest *request) {
    _configManager.clear();
    request->send(200, "application/json", "{\"status\":\"ok\"}");
    delay(500);
    ESP.restart();
  });

  _server.on("/api/wifi/list", HTTP_GET, [this](AsyncWebServerRequest* request) {
    int n = _wifiManager.getScanStatus();
    
    if (n == -2) {
      _wifiManager.requestScan();
      request->send(202, "application/json", "{\"status\":\"scanning\"}");
    } else if (n == -1) {
      request->send(202, "application/json", "{\"status\":\"scanning\"}");
    } else {
      DynamicJsonDocument doc = _wifiManager.getScanResults();
      String response;
      serializeJson(doc, response);
      request->send(200, "application/json", response);
    }
  });

  _server.on("/api/ping", HTTP_GET, [this](AsyncWebServerRequest* request) {
    request->send(200, "application/json", "{\"status\":\"ok\"}");
  });

  String redirectUrl = "http://" + String(MDNS_HOSTNAME) + ".local/";
  
  _server.on("/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/connecttest.txt", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/success.txt", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/connectivitycheck.android.com/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/clients3.google.com/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/connectivitycheck.gstatic.com/generate_204", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  _server.on("/hotspot-detect.html", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/canonical.html", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });
  _server.on("/library/test/success.html", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  _server.on("/ncsi.txt", HTTP_GET, [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  _server.on("/wpad.dat", [](AsyncWebServerRequest *request) { request->send(404); });
  _server.on("/redirect", [redirectUrl](AsyncWebServerRequest *request) { request->redirect(redirectUrl); });

  _server.onNotFound([this](AsyncWebServerRequest *request) {
    String path = request->url();
    if (path.endsWith("/")) path += "index.html";

    String gzPath = path + ".gz";
    if (_storageManager.exists(gzPath)) {
      String contentType = _getContentType(path);

      AsyncWebServerResponse *response = request->beginResponse(_storageManager.getFS(), gzPath, contentType);
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
