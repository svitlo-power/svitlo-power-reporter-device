import json
import os
import argparse
import re
import subprocess
import shutil

def update_config_h(config_path, fw_version, fs_version):
    if not os.path.exists(config_path):
        print(f"Error: {config_path} not found")
        return False

    with open(config_path, 'r') as f:
        content = f.read()

    # Update FW_VERSION
    content = re.sub(r'#define FW_VERSION ".*?"', f'#define FW_VERSION "{fw_version}"', content)
    # Update FS_VERSION
    content = re.sub(r'#define FS_VERSION ".*?"', f'#define FS_VERSION "{fs_version}"', content)

    with open(config_path, 'w') as f:
        f.write(content)

    print(f"Updated {config_path} with FW version {fw_version} and FS version {fs_version}")
    return True

def build_project():
    print("\n--- Step 2: Building Project ---")
    try:
        print("Building firmware...")
        subprocess.run(["pio", "run"], check=True, shell=True)
        
        print("Building filesystem...")
        subprocess.run(["pio", "run", "-t", "buildfs"], check=True, shell=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"\nBuild failed: {e}")
        return False
    except Exception as e:
        print(f"\nAn error occurred during build: {e}")
        return False

def generate_manifest(fw_bin, fs_bin, fw_version, fs_version, base_url, output_file):
    manifest = {
        "version": fw_version,
        "url": f"{base_url}/{os.path.basename(fw_bin)}",
        "fs_version": fs_version,
        "fs_url": f"{base_url}/{os.path.basename(fs_bin)}"
    }

    with open(output_file, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest generated: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Automate Svitlo Power device release process')
    parser.add_argument('--fw-ver', required=True, help='New Firmware version (e.g., 1.1.0)')
    parser.add_argument('--fs-ver', required=True, help='New Filesystem version (e.g., 1.1.0)')
    parser.add_argument('--url', required=True, help='Base HTTPS URL where files will be hosted')
    parser.add_argument('--fw-bin', default=os.path.join('.pio', 'build', 'esp32doit-devkit-v1', 'firmware.bin'), help='Path to firmware.bin')
    parser.add_argument('--fs-bin', default=os.path.join('.pio', 'build', 'esp32doit-devkit-v1', 'littlefs.bin'), help='Path to littlefs.bin')
    parser.add_argument('--config', default=os.path.join('include', 'config.h'), help='Path to config.h')
    parser.add_argument('--out', default='ota_manifest.json', help='Output manifest filename')
    parser.add_argument('--ota-dir', default='ota', help='Output directory for OTA files')
    parser.add_argument('--no-build', default=False, help='Do not build the binary files')

    args = parser.parse_args()

    # Step 1: Update version numbers in config.h
    if update_config_h(args.config, args.fw_ver, args.fs_ver):
        # Step 2: Build the project
        if args.no_build or build_project():
            # Step 3: Create OTA directory and generate manifest
            os.makedirs(args.ota_dir, exist_ok=True)
            manifest_path = os.path.join(args.ota_dir, args.out)
            generate_manifest(args.fw_bin, args.fs_bin, args.fw_ver, args.fs_ver, args.url, manifest_path)
            
            # Step 4: Copy binaries to OTA directory
            print("\n--- Step 4: Organizing OTA Files ---")
            for bin_file in [args.fw_bin, args.fs_bin]:
                if os.path.exists(bin_file):
                    shutil.copy2(bin_file, args.ota_dir)
                    print(f"Copied {bin_file} -> {args.ota_dir}/")
                else:
                    print(f"Warning: Binary not found: {bin_file}")
            
            print(f"\nSuccess! All release files are ready in the '{args.ota_dir}' folder.")
            print(f"You can now upload the contents of '{args.ota_dir}/' to {args.url}")
        else:
            print("\nRelease process aborted due to build failure.")
    else:
        print("\nRelease process aborted due to config update failure.")
