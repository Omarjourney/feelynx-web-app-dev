import argparse
import csv
import os
import sys
import tempfile
import subprocess
import tarfile
from typing import Dict, List

import regex


def acquire_source(source: str) -> str:
    """Return directory path to scan."""
    if source.startswith("http://") or source.startswith("https://"):
        tmpdir = tempfile.mkdtemp(prefix="audit_")
        try:
            subprocess.run([
                "git",
                "clone",
                "--depth",
                "1",
                source,
                tmpdir,
            ], check=True)
            return tmpdir
        except Exception as e:
            print(f"Failed to clone {source}: {e}", file=sys.stderr)
            sys.exit(1)
    if os.path.isdir(source):
        return source
    if os.path.isfile(source) and source.endswith((".tar", ".tar.gz", ".tgz")):
        tmpdir = tempfile.mkdtemp(prefix="audit_")
        with tarfile.open(source, "r:*") as tar:
            tar.extractall(tmpdir)
        return tmpdir
    raise FileNotFoundError(f"Cannot handle source: {source}")


def collect_files(directory: str) -> List[str]:
    allowed_exts = {".js", ".ts", ".go", ".py", ".yaml", ".yml"}
    results = []
    for root, _, files in os.walk(directory):
        for name in files:
            ext = os.path.splitext(name)[1].lower()
            if ext in allowed_exts or name.startswith("Dockerfile"):
                results.append(os.path.join(root, name))
    return results


def scan_files(files: List[str], targets: List[str], base: str) -> Dict[str, List[str]]:
    compiled = {t: regex.compile(regex.escape(t), regex.IGNORECASE) for t in targets}
    found = {t: ["N", "", ""] for t in targets}
    for path in files:
        rel = os.path.relpath(path, base)
        try:
            with open(path, "r", errors="ignore") as f:
                for idx, line in enumerate(f, start=1):
                    for t, pattern in compiled.items():
                        if found[t][0] == "Y":
                            continue
                        if pattern.search(line):
                            found[t] = ["Y", rel, str(idx)]
        except Exception:
            continue
    return found


def main() -> None:
    parser = argparse.ArgumentParser(description="Tech stack audit")
    parser.add_argument("--targets", required=True, help="Space separated tech names")
    parser.add_argument("--source", required=True, help="Local path or URL")
    args = parser.parse_args()

    targets = args.targets.split()
    base = acquire_source(args.source)
    files = collect_files(base)
    results = scan_files(files, targets, base)

    writer = csv.writer(sys.stdout)
    writer.writerow(["tool", "detected", "file_path", "line_number"])
    for t in targets:
        row = [t] + results[t]
        writer.writerow(row)


if __name__ == "__main__":
    main()
