import glob
import os
import re

# Get all test files
test_files = glob.glob('packages/seqs/test/async/*.test.ts', recursive=True)

final_content = ''

for file in test_files:
    # Read file content
    with open(file, 'r') as f:
        content = f.read()

    ss = """
import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"    
    """.strip()
    # Remove import statements
    content = "\n\n".join([ss, content])

    with open(file, 'w') as f:
        f.write(content)
