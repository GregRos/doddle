import glob
import os
import re

# Get all test files
test_files = glob.glob('packages/seqs/test/sync/*.test.ts', recursive=True)

final_content = ''

for file in test_files:
    # Read file content
    with open(file, 'r') as f:
        content = f.read()

    imports = """
import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"    
    """
    # Remove import statements
    content = imports + content

    with open(file, 'w') as f:
        f.write(content)
