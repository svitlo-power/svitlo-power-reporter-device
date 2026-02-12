#ifndef LITTLE_FS_MANAGER_H
#define LITTLE_FS_MANAGER_H

#include <LittleFS.h>

class StorageManager {
public:
  StorageManager();

  bool begin();

  String getFSVersion(const char* versionFilePath = "/version.txt");
  fs::FS& getFS();
  bool exists(const String& path);

private:
  bool _initialized;
};


#endif