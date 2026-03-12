#!/usr/bin/env python3
"""
Extract text from PDF file using pdfplumber.
Usage: python3 extract-pdf.py <pdf_file_path>
"""

import sys
import os

def extract_pdf(pdf_path: str) -> str:
    """Extract text from all pages of a PDF file."""
    try:
        import pdfplumber
    except ImportError:
        print("Error: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    try:
        text_parts = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                
                if page_text:
                    # Add page separator
                    text_parts.append(f"--- PÁGINA {i} ---\n\n{page_text.strip()}")
        
        result = "\n\n".join(text_parts)
        
        # Clean up the text
        result = result.replace('\r\n', '\n').replace('\r', '\n')
        
        return result
        
    except Exception as e:
        print(f"Error processing PDF: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 extract-pdf.py <pdf_file_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    text = extract_pdf(pdf_path)
    print(text)
