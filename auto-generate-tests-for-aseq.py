import glob
import os
from pathlib import Path
import re


def get_files(package: str):
    return Path(package).glob("")
# Get all test files
sync_tests = glob.glob('packages/seqs/test/async/*.test.ts', recursive=True)
