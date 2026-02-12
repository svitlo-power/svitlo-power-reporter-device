#include "StorageManager.h"

StorageManager::StorageManager()
  : _initialized(false) {
}

bool StorageManager::begin() {
  if (!LittleFS.begin(false, "/littlefs", 20, "littlefs")) {
    Serial.println("[LFS]  Error initializing LittleFS");
    _initialized = false;
    return false;
  }

  _initialized = true;
  return true;
}

String StorageManager::getFSVersion(const char* versionFilePath) {
  if (!_initialized) {
    Serial.println("[LFS]  FS not initialized");
    return String();
  }

  if (!LittleFS.exists(versionFilePath)) {
    Serial.println("[LFS]  version.txt not found");
    return String();
  }

  File file = LittleFS.open(versionFilePath, "r");
  if (!file) {
    Serial.println("[LFS]  Failed to open version.txt");
    return String();
  }

  String version = file.readStringUntil('\n');
  version.trim();
  file.close();

  return version;
}

fs::FS& StorageManager::getFS() {
    return LittleFS;
}

bool StorageManager::exists(const String& path) {
    if (!_initialized) return false;
    return LittleFS.exists(path);
}