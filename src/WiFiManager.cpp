#include "WiFiManager.h"

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);

WiFiManager::WiFiManager(ConfigManager& config) : configManager(config), _apMode(false) {}

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
}

bool WiFiManager::isConnected() {
  return WiFi.status() == WL_CONNECTED;
}
