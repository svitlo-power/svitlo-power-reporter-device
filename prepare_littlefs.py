from SCons.Script import Import
import os
import shutil
import subprocess
import gzip
import shutil as sh

Import("env")

REACT_DIR = "webapp"
BUILD_DIR = os.path.join(REACT_DIR, "dist")
DATA_DIR = "data"

def log(msg):
    print(f"[LittleFS] {msg}")

def find_npm():
    npm = sh.which("npm") or sh.which("npm.cmd")
    if not npm:
        raise RuntimeError(
            "npm not found. Make sure Node.js is installed and in PATH."
        )
    return npm

def run_react_build():
    npm = find_npm()
    log(f"Building React app using {npm}...")
    subprocess.check_call(
        [npm, "run", "build"],
        cwd=REACT_DIR,
        shell=False
    )

def clean_data_dir():
    if os.path.exists(DATA_DIR):
        shutil.rmtree(DATA_DIR)
    os.makedirs(DATA_DIR)
    log("Prepared data directory")

def gzip_file(src, dst):
    with open(src, "rb") as f_in:
        with gzip.open(dst, "wb", compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)

def should_gzip_file(name):
    return True if name != 'version.txt' else False

def process_files():
    log("Gzipping files...")
    for root, _, files in os.walk(BUILD_DIR):
        for name in files:
            if name.endswith(".gz") or name.endswith(".map"):
                continue

            src = os.path.join(root, name)
            rel = os.path.relpath(src, BUILD_DIR)
            dst = (
                os.path.join(DATA_DIR, rel) + ".gz" if should_gzip_file(name)
                else os.path.join(DATA_DIR, rel)
            )

            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if should_gzip_file(name):
                gzip_file(src, dst)
            else:
                shutil.copyfile(src, dst)

def print_fs_usage():
    total = 0
    for root, _, files in os.walk(DATA_DIR):
        for f in files:
            total += os.path.getsize(os.path.join(root, f))

    log(f"Raw data size: {total / 1024:.1f} KB")

def prepare_littlefs(source, target, env):
    run_react_build()
    clean_data_dir()
    process_files()
    log("LittleFS image ready ✔")
    print_fs_usage()

env.AddPreAction("$BUILD_DIR/littlefs.bin", prepare_littlefs)