#include "LedManager.h"

LedManager::LedManager(uint8_t ledPin, bool inverted)
  : _pin(ledPin),
    _inverted(inverted),
    _mode(MODE_OFF),
    _previousMillis(0),
    _interval(1000),
    _ledState(false) {
}

void LedManager::begin() {
  pinMode(_pin, OUTPUT);
  writeLed(false);
}

void LedManager::setMode(Mode mode) {
  if (_mode == mode) return;

  _mode = mode;
  applyModeSettings();
}

LedManager::Mode LedManager::getMode() const {
  return _mode;
}

void LedManager::setInverted(bool inverted) {
  _inverted = inverted;
  writeLed(_ledState);
}

bool LedManager::isInverted() const {
  return _inverted;
}

void LedManager::applyModeSettings() {
  switch (_mode) {
    case MODE_OFF:
      _ledState = false;
      writeLed(false);
      break;

    case MODE_STA:
      _interval = 1000;
      break;

    case MODE_AP:
      _interval = 300;
      break;

    case MODE_OTA:
      _interval = 100;
      break;
  }

  _previousMillis = millis();
}

void LedManager::writeLed(bool on) {
  if (_inverted) {
    digitalWrite(_pin, on ? LOW : HIGH);
  } else {
    digitalWrite(_pin, on ? HIGH : LOW);
  }
}

void LedManager::handle() {
  if (_mode == MODE_OFF) return;

  unsigned long currentMillis = millis();

  if (currentMillis - _previousMillis >= _interval) {
    _previousMillis = currentMillis;

    _ledState = !_ledState;
    writeLed(_ledState);
  }
}