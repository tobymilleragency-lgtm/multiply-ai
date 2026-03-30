#!/bin/bash

# Thunderbird Account Information Extractor
# This script helps identify configured accounts and folder structure

echo "=== Thunderbird Account Analysis ==="
echo "Profile Directory: ~/snap/thunderbird/common/.thunderbird/yrzhgjb9.default"
echo ""

# Check if Thunderbird profile exists
PROFILE_DIR="$HOME/snap/thunderbird/common/.thunderbird/yrzhgjb9.default"

if [ ! -d "$PROFILE_DIR" ]; then
    echo "ERROR: Thunderbird profile directory not found!"
    exit 1
fi

echo "1. Checking for mail account configurations..."
echo ""

# Look for mail account settings
if [ -f "$PROFILE_DIR/prefs.js" ]; then
    echo "Found preferences file. Extracting account information..."
    echo ""
    
    # Extract account information from prefs.js
    echo "Email Accounts Found:"
    grep -E "mail\.account\." "$PROFILE_DIR/prefs.js" | grep -E "server|name|user" | head -20
    echo ""
    
    echo "Mail Servers Configured:"
    grep -E "mail\.server\." "$PROFILE_DIR/prefs.js" | grep -E "hostname|type|name" | head -20
    echo ""
    
    echo "IMAP/POP3 Settings:"
    grep -E "mail\.imap|mail\.pop3" "$PROFILE_DIR/prefs.js" | head -10
    echo ""
else
    echo "No preferences file found - Thunderbird may not be fully configured yet."
fi

echo "2. Checking for existing folder structure..."
MAIL_DIR="$PROFILE_DIR/Mail"
if [ -d "$MAIL_DIR" ]; then
    echo "Mail directory found. Listing subdirectories:"
    find "$MAIL_DIR" -type d -name "*" | head -20
    echo ""
else
    echo "No Mail directory found yet - accounts may not be fully configured."
fi

echo "3. Checking for existing message filters..."
FILTER_FILE="$PROFILE_DIR/msgFilterRules.dat"
if [ -f "$FILTER_FILE" ]; then
    echo "Filter rules file found. Number of existing filters:"
    grep -c "name=" "$FILTER_FILE" 2>/dev/null || echo "0"
    echo ""
else
    echo "No existing message filters found."
fi

echo "=== Analysis Complete ==="
echo ""
echo "Next steps:"
echo "1. If no accounts are configured, you'll need to set up email accounts in Thunderbird first"
echo "2. If accounts exist, we can proceed with creating the folder organization system"
echo "3. The folder system will be created via Thunderbird's UI or configuration files"