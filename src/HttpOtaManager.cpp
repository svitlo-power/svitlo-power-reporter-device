#include "HttpOtaManager.h"
#include "config.h"
#include <esp_partition.h>
#include <spi_flash_mmap.h>

HttpOtaManager::HttpOtaManager() {}

void HttpOtaManager::checkForUpdates() {
  Serial.println("[OTA] Checking for updates...");
  
  DynamicJsonDocument doc(1024);
  if (!_fetchManifest(doc)) {
    Serial.println("[OTA] Failed to fetch manifest");
    return;
  }

  String newFwVersion = doc["version"];
  String fwUrl = doc["url"];
  String newFsVersion = doc["fs_version"];
  String fsUrl = doc["fs_url"];

  Serial.printf("[OTA] Current FW: %s, New FW: %s\n", FW_VERSION, newFwVersion.c_str());
  Serial.printf("[OTA] Current FS: %s, New FS: %s\n", FS_VERSION, newFsVersion.c_str());

  bool updateFw = (newFwVersion != FW_VERSION && fwUrl.length() > 0);
  bool updateFs = (newFsVersion != FS_VERSION && fsUrl.length() > 0);

  if (updateFs) {
    Serial.println("[OTA] Updating LittleFS...");
    _performUpdate(fsUrl, U_SPIFFS);
  }

  if (updateFw) {
    Serial.println("[OTA] Updating Firmware...");
    _performUpdate(fwUrl, U_FLASH);
  }

  if (!updateFw && !updateFs) {
    Serial.println("[OTA] No updates found");
  }
}

bool HttpOtaManager::_fetchManifest(DynamicJsonDocument& doc) {
  HTTPClient http;
  http.begin(OTA_MANIFEST_URL);
  
  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
      Serial.printf("[OTA] JSON parsing failed: %s\n", error.c_str());
      http.end();
      return false;
    }
    http.end();
    return true;
  } else {
    Serial.printf("[OTA] HTTP GET failed, error: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}

const esp_partition_t* _findLittleFSPartition() {
  return esp_partition_find_first(
    ESP_PARTITION_TYPE_DATA,
    ESP_PARTITION_SUBTYPE_DATA_LITTLEFS,
    NULL
  );
}

bool HttpOtaManager::_otaUpdateApp(const String& url) {
  Serial.printf("[OTA] Downloading App from: %s\n", url.c_str());
  HTTPClient http;
  http.begin(url);

  int httpCode = http.GET();
  if (httpCode != HTTP_CODE_OK) {
    Serial.printf("[OTA] App download failed, HTTP code: %d\n", httpCode);
    http.end();
    return false;
  }

  int contentLength = http.getSize();
  if (contentLength <= 0) {
    Serial.println("[OTA] Invalid content length for App update");
    http.end();
    return false;
  }

  Serial.printf("[OTA] App Size: %d bytes. Starting update...\n", contentLength);
  WiFiClient& client = http.getStream();

  if (!Update.begin(contentLength, U_FLASH)) {
    Serial.printf("[OTA] Update.begin failed: %s\n", Update.errorString());
    http.end();
    return false;
  }

  size_t written = Update.writeStream(client);

  if (written != contentLength) {
    Serial.printf("[OTA] Written only %u/%d bytes. Aborting.\n", written, contentLength);
    Update.abort();
    http.end();
    return false;
  }

  if (!Update.end(true)) {
    Serial.printf("[OTA] Update.end failed: %s\n", Update.errorString());
    http.end();
    return false;
  }

  Serial.println("[OTA] App update successful. Rebooting...");
  http.end();
  ESP.restart();
  return true;
}

bool HttpOtaManager::_otaUpdateFS(const String& url) {
  Serial.printf("[OTA] Downloading FS from: %s\n", url.c_str());
  HTTPClient http;
  http.begin(url);

  int httpCode = http.GET();
  if (httpCode != HTTP_CODE_OK) {
    Serial.printf("[OTA] FS download failed, HTTP code: %d\n", httpCode);
    http.end();
    return false;
  }

  WiFiClient& client = http.getStream();
  int totalSize = http.getSize();
  if (totalSize <= 0) {
    Serial.println("[OTA] Invalid content length for FS update");
    http.end();
    return false;
  }

  Serial.printf("[OTA] FS Size: %d bytes. Starting update...\n", totalSize);

  const esp_partition_t* part = _findLittleFSPartition();
  if (!part) {
    Serial.println("[OTA] LittleFS partition not found");
    http.end();
    return false;
  }

  Serial.println("[OTA] Erasing LittleFS partition...");
  esp_err_t err = esp_partition_erase_range(
    part, 0, part->size
  );
  if (err != ESP_OK) {
    Serial.printf("[OTA] Partition erase failed: %d\n", err);
    http.end();
    return false;
  }

  uint8_t buffer[4096];
  size_t written = 0;
  size_t offset = 0;

  while (client.connected() && written < totalSize) {
    size_t available = client.available();
    if (!available) {
      delay(1);
      continue;
    }

    size_t toRead = min(sizeof(buffer), available);
    int readBytes = client.readBytes(buffer, toRead);

    err = esp_partition_write(part, offset, buffer, readBytes);
    if (err != ESP_OK) {
      Serial.printf("[OTA] Partition write failed: %d\n", err);
      http.end();
      return false;
    }

    offset += readBytes;
    written += readBytes;
  }

  if (written != totalSize) {
    Serial.printf("[OTA] Written only %u/%d bytes. Aborting.\n", written, totalSize);
    http.end();
    return false;
  }

  Serial.println("[OTA] FS update successful");
  http.end();
  return true;
}

void HttpOtaManager::_performUpdate(const String& url, int updateType) {
  bool success = false;
  if (updateType == U_FLASH) {
    success = _otaUpdateApp(url);
  } else {
    success = _otaUpdateFS(url);
  }

  if (!success) {
    Serial.println("[OTA] Update failed!");
  }
}
