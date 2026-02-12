#ifndef LED_MANAGER_H
#define LED_MANAGER_H

#include <Arduino.h>

class LedManager {
  public:
    enum Mode {
      MODE_OFF,
      MODE_STA,
      MODE_AP,
      MODE_OTA
    };

    explicit LedManager(uint8_t ledPin, bool inverted = false);

    void begin();

    void setMode(Mode mode);
    Mode getMode() const;

    void setInverted(bool inverted);
    bool isInverted() const;

    void handle();

  private:
    uint8_t _pin;
    bool _inverted;

    Mode _mode;

    unsigned long _previousMillis;
    unsigned long _interval;
    bool _ledState;

    void applyModeSettings();
    void writeLed(bool on);
};

#endif
