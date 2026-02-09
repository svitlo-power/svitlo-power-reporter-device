#include "WiFiManager.h"

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);

WiFiManager::WiFiManager(ConfigManager& config) : configManager(config), _apMode(false), _scanRequested(false) {}

void WiFiManager::begin() {
  String ssid = configManager.getWifiSSID();
  String password = configManager.getWifiPassword();

  if (ssid == "") {
    Serial.println("No WiFi credentials found. Starting AP...");
    _startAP();
  } else {
    Serial.println("Connecting to WiFi: " + ssid);
    _startSTA(ssid, password);
  }
}

void WiFiManager::_startAP() {
  _apMode = true;
  WiFi.setHostname("svitlo-power-mon-device");
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP("SvitloPower-Setup");

  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.start(DNS_PORT, "*", apIP);
  Serial.println("AP Started. IP: " + WiFi.softAPIP().toString());
  
  // Initial scan to have results ready
  WiFi.scanNetworks(true);
}

void WiFiManager::_startSTA(const String& ssid, const String& password) {
  _apMode = false;
  WiFi.setHostname("svitlo-power-mon-device");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi connection failed. Starting AP...");
    _startAP();
  }
}

void WiFiManager::handle() {
  if (_apMode) {
    dnsServer.processNextRequest();
  }

  if (_scanRequested) {
    if (WiFi.scanComplete() != -1) { // -1 means scanning in progress
      WiFi.scanNetworks(true);
      _scanRequested = false;
      Serial.println("WiFi Scan started in background");
    }
  }
}

bool WiFiManager::isConnected() {
  return WiFi.status() == WL_CONNECTED;
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

  if (n > 0) {
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
