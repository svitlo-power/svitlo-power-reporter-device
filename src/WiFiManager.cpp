#include "WiFiManager.h"
#include "config.h"

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);

WiFiManager::WiFiManager(ConfigManager& config) : configManager(config), _apMode(false), _scanRequested(false), _staConnected(false), _lastConnectionAttemptTime(0), _staConnectionTime(0) {}

void WiFiManager::begin() {
  _startAP();

  String ssid = configManager.getWifiSSID();
  String password = configManager.getWifiPassword();

  if (ssid != "") {
    Serial.println("[WiFi] Configured WiFi found. Starting connection to: " + ssid);
    _startSTA(ssid, password);
  } else {
    Serial.println("[WiFi] No WiFi credentials found. Running in AP-only mode.");
  }
}

void WiFiManager::_startAP() {
  _apMode = true;

  WiFi.mode(WIFI_AP); 

  WiFi.setHostname(MDNS_HOSTNAME);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP("SvitloPower-Setup");

  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.start(DNS_PORT, "*", apIP);
  Serial.println("[WiFi] AP Started. IP: " + WiFi.softAPIP().toString());
  
  if (MDNS.begin(MDNS_HOSTNAME)) {
    Serial.println("[WiFi] mDNS responder started in AP mode: " + String(MDNS_HOSTNAME) + ".local");
  } else {
    Serial.println("[WiFi] Error starting mDNS responder in AP mode");
  }

  WiFi.scanNetworks(true);
}

void WiFiManager::_startSTA(const String& ssid, const String& password) {
  WiFi.mode(WIFI_AP_STA);
  WiFi.setHostname(MDNS_HOSTNAME); 

  Serial.println("[WiFi] Connecting to WiFi: " + ssid);
  WiFi.begin(ssid.c_str(), password.c_str());
  
  _lastConnectionAttemptTime = millis();
}

void WiFiManager::handle() {
  dnsServer.processNextRequest();

  if (WiFi.status() == WL_CONNECTED) {
    if (!_staConnected) {
      _staConnected = true;
      Serial.println("\n[WiFi] Connected. IP: " + WiFi.localIP().toString());
      
      if (MDNS.begin(MDNS_HOSTNAME)) {
        Serial.println("[WiFi] mDNS responder updated: " + String(MDNS_HOSTNAME) + ".local");
      }
      
      _staConnectionTime = millis();
    }
    
    if (_apMode && millis() - _staConnectionTime > AP_SHUTDOWN_DELAY) {
       WiFi.softAPdisconnect(true);
       WiFi.mode(WIFI_STA);
       _apMode = false;
       Serial.println("[WiFi] Connected. Stopping Access Point.");
    }
  } else {
    if (_staConnected) {
      _staConnected = false;
      Serial.println("\n[WiFi] Connection lost. Starting AP...");
      _startAP();
      
      String ssid = configManager.getWifiSSID();
      String password = configManager.getWifiPassword();
      if (ssid != "") {
        _staConnectionTime = 0;
        _startSTA(ssid, password);
      }
    }
  }

  if (_scanRequested) {
    if (WiFi.scanComplete() != -1) {
      WiFi.scanNetworks(true);
      _scanRequested = false;
      Serial.println("[WiFi] Scan started in background");
    }
  }
}

bool WiFiManager::isConnected() {
  return _staConnected;
}

String WiFiManager::getIP() {
  if (_staConnected) {
    return WiFi.localIP().toString();
  }
  return WiFi.softAPIP().toString();
}

String WiFiManager::getStatus() {
  String status = "";
  if (_staConnected) {
    status = "Connected";
  } else {
    String ssid = configManager.getWifiSSID();
    if (ssid != "") {
      status = "Connecting to " + ssid;
    } else {
      status = "AP Mode (No Config)";
    }
  }
  return status;
}

bool WiFiManager::isAPMode() {
  return (WiFi.getMode() & WIFI_MODE_AP) != 0;
}

void WiFiManager::requestScan() {
  _scanRequested = true;
}

int WiFiManager::getScanStatus() {
  return WiFi.scanComplete();
}

DynamicJsonDocument WiFiManager::getScanResults() {
  int n = WiFi.scanComplete();
  DynamicJsonDocument doc(4096);
  JsonArray networks = doc.to<JsonArray>();

  if (n >= 0) {
    for (int i = 0; i < n; ++i) {
      JsonObject network = networks.createNestedObject();
      network["ssid"] = WiFi.SSID(i);
      network["rssi"] = WiFi.RSSI(i);
      network["secure"] = WiFi.encryptionType(i) != WIFI_AUTH_OPEN;
    }
    WiFi.scanDelete();
  }
  return doc;
}

void WiFiManager::reconfigure() {
  Serial.println("[WiFi] Reconfiguring...");
  
  WiFi.disconnect(); 
  _staConnected = false;
  _staConnectionTime = 0;

  String ssid = configManager.getWifiSSID();
  String password = configManager.getWifiPassword();

  if (ssid != "") {
    Serial.println("[WiFi] New configuration found. Connecting to: " + ssid);
    _startSTA(ssid, password);
  } else {
    Serial.println("[WiFi] No WiFi credentials. Staying in AP mode.");
  }
}
