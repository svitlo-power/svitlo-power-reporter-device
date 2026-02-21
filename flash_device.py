#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys

# Default paths based on PlatformIO structure
DEFAULT_BUILD_DIR = os.path.join(".pio", "build")
DEFAULT_ENV = "esp32c3-super-mini"

# Memory offsets
BOOTLOADER_OFFSET = {
    "esp32": "0x1000",
    "esp32c3": "0x0",
    "esp32c3-super-mini": "0x0",
    "esp32doit-devkit-v1": "0x1000"
}
PARTITIONS_OFFSET = "0x8000"
FIRMWARE_OFFSET = "0x10000"
LITTLEFS_OFFSET = "0x310000"

def find_esptool():
    """Try to find esptool.py in various locations."""
    # 1. Try esptool.py directly
    try:
        subprocess.run(["esptool.py", "version"], check=True, capture_output=True)
        return ["esptool.py"]
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    # 2. Try python -m esptool
    try:
        subprocess.run([sys.executable, "-m", "esptool", "version"], check=True, capture_output=True)
        return [sys.executable, "-m", "esptool"]
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    # 3. Try PlatformIO's bundled esptool (via pio pkg exec)
    # We check if 'pio' command is available
    pio_cmd = "pio.exe" if sys.platform == "win32" else "pio"
    try:
        subprocess.run([pio_cmd, "--version"], check=True, capture_output=True)
        return [pio_cmd, "pkg", "exec", "--", "esptool.py"]
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    return None

def flash(port, env, dry_run):
    esptool_base = find_esptool()
    if not esptool_base:
        print("Error: esptool.py not found. Please install it with 'pip install esptool' or ensure PlatformIO is in your PATH.")
        sys.exit(1)

    build_dir = os.path.join(DEFAULT_BUILD_DIR, env)
    
    files = {
        "bootloader": os.path.join(build_dir, "bootloader.bin"),
        "partitions": os.path.join(build_dir, "partitions.bin"),
        "firmware": os.path.join(build_dir, "firmware.bin"),
        "littlefs": os.path.join(build_dir, "littlefs.bin")
    }

    # Check if all files exist
    missing = []
    for name, path in files.items():
        if not os.path.exists(path):
            missing.append(path)
    
    if missing:
        print("Error: Missing binary files. Have you built the project?")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)

    # Determine bootloader offset
    offset = BOOTLOADER_OFFSET.get(env, "0x1000") # Default to 0x1000 for standard ESP32

    # Construct the command list
    command_list = esptool_base.copy()
    if port:
        command_list += ["--port", port]
    
    command_list += ["--baud", "921600", "write_flash"]
    command_list += [offset, files['bootloader']]
    command_list += [PARTITIONS_OFFSET, files['partitions']]
    command_list += [FIRMWARE_OFFSET, files['firmware']]
    command_list += [LITTLEFS_OFFSET, files['littlefs']]

    print(f"Executing: {' '.join(command_list)}")
    
    if dry_run:
        print("\n--- Dry Run Completed ---")
        return

    try:
        subprocess.run(command_list, check=True)
        print("\nFlashing successful!")
    except subprocess.CalledProcessError as e:
        print(f"\nFlashing failed with error code {e.returncode}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Flash ESP32 device with bootloader, partitions, app, and LittleFS.")
    parser.add_argument("--port", help="Serial port of the device")
    parser.add_argument("--env", default=DEFAULT_ENV, help=f"PlatformIO environment name (default: {DEFAULT_ENV})")
    parser.add_argument("--dry-run", action="store_true", help="Print the command without executing it")

    args = parser.parse_args()
    
    flash(args.port, args.env, args.dry_run)
