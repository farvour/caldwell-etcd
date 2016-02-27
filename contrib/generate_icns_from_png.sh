#!/usr/bin/env bash
OUTPUT_DIR="./build"
SIPS_DIR="Caldwell.iconset"
ORIGINAL_PNG="../assets/osx/installer.png"

# Create temporary building directory for the sips tool.
mkdir -p ${OUTPUT_DIR}/${SIPS_DIR}

# Move into build directory.
cd ${OUTPUT_DIR}

# Generate each size from parent original PNG file.
sips -z 16 16     ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_16x16.png
sips -z 32 32     ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_16x16@2x.png
sips -z 32 32     ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_32x32.png
sips -z 64 64     ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_32x32@2x.png
sips -z 128 128   ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_128x128.png
sips -z 256 256   ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_128x128@2x.png
sips -z 256 256   ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_256x256.png
sips -z 512 512   ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_256x256@2x.png
sips -z 512 512   ${ORIGINAL_PNG} --out ${SIPS_DIR}/icon_512x512.png

# Copy the original PNG file.
cp ${ORIGINAL_PNG} ${SIPS_DIR}/icon_512x512@2x.png

# Convert to an .icns file.
iconutil -c icns ${SIPS_DIR}

# Remove sips command build dir.
rm -R ${SIPS_DIR}
