# Svitlo Power Reporter Device

An ESP32-based device for monitoring power status, featuring a built-in web server, WiFi management, and automated HTTP OTA updates.

## Features

- **WiFi Management**: Connects to existing WiFi or starts an Access Point for configuration.
- **Web Server**: Hosts a web interface (LittleFS) for data visualization and configuration.
- **HTTP OTA Updates**: Automatically checks for and applies firmware and filesystem updates from a remote HTTPS server.
- **NTP Time Sync**: Synchronizes time with NTP servers on startup.

## Getting Started

### Prerequisites

- [PlatformIO](https://platformio.org/) installed in VS Code or as a CLI.
- ESP32 development board (e.g., ESP32 DevKit V1).

### Build and Flash

1.  Clone the repository.
2.  Open the project in PlatformIO.
3.  Build and upload the firmware:
    ```bash
    pio run -t upload
    ```
4.  Build and upload the LittleFS filesystem:
    ```bash
    pio run -t uploadfs
    ```

## HTTP OTA Updates

The device is configured to check for updates on every reboot after connecting to WiFi.

### Configuration

Update the constants in `include/config.h`:
- `FW_VERSION`: Increment this when you release a new firmware version.
- `OTA_MANIFEST_URL`: The full URL to your `ota_manifest.json` on your HTTPS server.

Update web version in `webapp/public/version.txt`:
- file should only contain the 3-digit dot-separated version number
- file should end with the newline (`\n`)

### Release Automation

To simplify the update process, use the `release.py` script. It automatically updates the version numbers in `include/config.h` and `webapp/public/version.txt` and generates the `ota_manifest.json` file.

```bash
python release.py \
  --fw-ver 1.1.0 \
  --fs-ver 1.1.0 \
  --url https://svitlo-power.pp.ua/ota
```

This command will:
1.  Update `FW_VERSION` in `include/config.h` and set `FS_VERSION` in `webapp/public/version.txt`.
2.  Generate `ota_manifest.json` pointing to your server URL.

### Deployment Flow

1.  **Run Automation**: Run `release.py` as shown above with your new version numbers.
2.  **Build**:
    - Firmware: `pio run -t upload` (or just `pio run` to build)
    - Filesystem: `pio run -t buildfs`
3.  **Upload**: Upload the following files to your HTTPS server:
    - `.pio/build/esp32doit-devkit-v1/firmware.bin`
    - `.pio/build/esp32doit-devkit-v1/littlefs.bin`
    - `ota_manifest.json`

The device will automatically detect the version change on its next reboot.

> [!TIP]
> A sample manifest is provided as `ota_manifest.sample.json`. The actual `ota_manifest.json` is ignored by git to prevent accidental version conflicts in the repository.

## Project Structure

- `src/`: Source code (`main.cpp`, `HttpOtaManager.cpp`, etc.).
- `include/`: Header files and configuration.
- `data/`: Files to be uploaded to LittleFS.
- `webapp/`: Source code for the web interface.
- `prepare_littlefs.py`: Script to prepare files for LittleFS upload.
- `generate_ota_manifest.py`: Script for OTA deployment.
