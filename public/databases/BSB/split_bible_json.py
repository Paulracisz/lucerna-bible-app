#!/usr/bin/env python3
"""
split_bible_json.py

Split a huge JSON file that contains an array of verse objects into one
JSON file per Bible book (keyed by the `bookId` field).

Usage
-----
    python split_bible_json.py INPUT_FILE.json OUTPUT_DIR [--mode mem|stream]

Arguments
---------
    INPUT_FILE.json   Path to the giant JSON file (must be a top‑level array).
    OUTPUT_DIR        Directory that will receive the per‑book files.
    --mode            Optional.  Either:
                         * mem    – read everything into memory (default for <~200 MB)
                         * stream – write incrementally, constant memory usage.

Examples
--------
    # Simple in‑memory split (fast, needs enough RAM)
    python split_bible_json.py bsbverses.json ./books

    # Low‑memory streaming split (works for multi‑GB inputs)
    python split_bible_json.py bsbverses.json ./books --mode stream
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, TextIO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Split a massive Bible JSON file into per‑book files.")
    parser.add_argument("input_file", type=Path, help="Path to the giant JSON file (array of objects).")
    parser.add_argument("output_dir", type=Path, help="Directory where per‑book JSON files will be written.")
    parser.add_argument(
        "--mode",
        choices=["mem", "stream"],
        default="mem",
        help="Processing mode: 'mem' keeps everything in RAM (fast for modest sizes), "
             "'stream' writes incrementally with constant memory.",
    )
    return parser.parse_args()


# ----------------------------------------------------------------------
# Helper for the **in‑memory** approach
# ----------------------------------------------------------------------
def split_mem(input_path: Path, out_dir: Path) -> None:
    """
    Load the whole JSON array, group by bookId, then dump each group.
    Suitable when the file comfortably fits in RAM.
    """
    print(f"[MEM] Loading entire file into memory …")
    with input_path.open("r", encoding="utf-8") as f:
        data = json.load(f)                     # <-- a list of dicts

    print(f"[MEM] Grouping {len(data):,} records by bookId …")
    grouped: Dict[str, List[dict]] = defaultdict(list)
    for obj in data:
        book_id = obj.get("bookId")
        if not book_id:
            # Defensive: skip malformed entries but keep processing
            continue
        grouped[book_id].append(obj)

    print(f"[MEM] Writing {len(grouped)} book files to {out_dir} …")
    out_dir.mkdir(parents=True, exist_ok=True)

    for book_id, objs in grouped.items():
        out_path = out_dir / f"{book_id}.json"
        with out_path.open("w", encoding="utf-8") as out_f:
            json.dump(objs, out_f, ensure_ascii=False, separators=(",", ":"))
        print(f"  • {out_path.name} ({len(objs):,} verses)")

    print("[MEM] Done.")


# ----------------------------------------------------------------------
# Helper for the **streaming** approach (constant memory)
# ----------------------------------------------------------------------
class JsonArrayWriter:
    """
    Tiny utility that writes a valid JSON array to a file incrementally.
    It handles commas, opening/closing brackets, and proper flushing.
    """
    def __init__(self, fp: TextIO):
        self.fp = fp
        self.first = True
        self.closed = False
        self.fp.write("[")                       # start of array

    def write_item(self, item: dict) -> None:
        if not self.first:
            self.fp.write(",")
        else:
            self.first = False
        # Dump the single object without extra whitespace
        json.dump(item, self.fp, ensure_ascii=False, separators=(",", ":"))

    def close(self) -> None:
        if not self.closed:
            self.fp.write("]")
            self.fp.flush()
            self.closed = True


def split_stream(input_path: Path, out_dir: Path) -> None:
    """
    Read the giant JSON file line‑by‑line, detect the start/end of each object,
    and write each object to the appropriate per‑book writer.
    This never holds more than one object (plus a few buffers) in memory.
    """
    print("[STREAM] Opening input file …")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Keep a map of bookId → JsonArrayWriter (opened lazily)
    writers: Dict[str, JsonArrayWriter] = {}

    def get_writer(book_id: str) -> JsonArrayWriter:
        if book_id not in writers:
            fp = (out_dir / f"{book_id}.json").open("w", encoding="utf-8")
            writers[book_id] = JsonArrayWriter(fp)
        return writers[book_id]

    # The input file is a single JSON array: `[ {...}, {...}, ... ]`.
    # We'll parse it manually to avoid loading the whole thing.
    # Strategy:
    #   * Skip the opening '['
    #   * Read characters until we have a complete JSON object (balanced braces)
    #   * Decode that object with json.loads()
    #   * Dispatch it to the right writer.
    #
    # This works even if the file is pretty‑printed or minified.
    with input_path.open("r", encoding="utf-8") as f:
        buffer = ""
        depth = 0
        in_string = False
        escape = False
        started = False   # have we seen the first '[' ?

        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            for ch in chunk:
                # ---------------------------------------------------------
                # Detect the outer array brackets and ignore whitespace
                # ---------------------------------------------------------
                if not started:
                    if ch.isspace():
                        continue
                    if ch == "[":
                        started = True
                        continue
                    raise ValueError("Input does not start with a JSON array '['")
                # ---------------------------------------------------------
                # Once started, accumulate characters that belong to an object
                # ---------------------------------------------------------
                if not depth and ch.isspace():
                    # skip whitespace between objects / commas
                    continue
                buffer += ch

                # Track string literals so we don’t count braces inside them
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_string = not in_string

                if not in_string:
                    if ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1

                # When depth returns to zero we have a full object
                if depth == 0 and buffer.strip():
                    # Remove a trailing comma that belongs to the outer array
                    obj_str = buffer.rstrip().rstrip(",")
                    try:
                        obj = json.loads(obj_str)
                    except json.JSONDecodeError as exc:
                        raise ValueError(f"Failed to decode JSON object: {exc}\nProblematic snippet: {obj_str[:200]}") from exc

                    book_id = obj.get("bookId")
                    if not book_id:
                        # Silently ignore malformed entries – you can log if you wish
                        buffer = ""
                        continue

                    writer = get_writer(book_id)
                    writer.write_item(obj)

                    # Reset buffer for the next object
                    buffer = ""

        # End of file – close all writers
        for w in writers.values():
            w.close()

    print(f"[STREAM] Finished. Wrote {len(writers)} book files to {out_dir}.")


# ----------------------------------------------------------------------
def main() -> None:
    args = parse_args()

    if not args.input_file.is_file():
        sys.exit(f"❌ Input file not found: {args.input_file}")

    if args.mode == "mem":
        split_mem(args.input_file, args.output_dir)
    else:
        split_stream(args.input_file, args.output_dir)


if __name__ == "__main__":
    main()