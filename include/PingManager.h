#ifndef PING_MANAGER_H
#define PING_MANAGER_H

#include <Arduino.h>
#include "WiFiManager.h"
#include "StorageManager.h"
#include "ConfigManager.h"
#include "config.h"

class PingManager {
  public:
    PingManager(WiFiManager &wifiMgr, StorageManager &storageMgr, ConfigManager &configMgr);
    void handle();

  private:
    WiFiManager &_wifiMgr;
    StorageManager &_storageMgr;
    ConfigManager &_configMgr;
    unsigned long _lastPingTime;
    const unsigned long _pingInterval = PING_INTERVAL_MS;

    void sendPing();
};

#endif
