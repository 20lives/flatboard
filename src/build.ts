import { writeFileSync } from "fs";
import { union } from "scad-js";

import { getLayoutForBuildSide, calculatePlateDimensions } from './layout.js';
import { generateKeyboardPlate } from './top.js';
import { generateBottomCase } from './bottom.js';
import { createConfig, KEYBOARD_PROFILES, DEFAULT_PROFILE } from './config.js';

/**
 * Builds keyboard components with the specified configuration
 */
function buildWithConfig(profileName?: string) {
  const CONFIG = createConfig(profileName);
  
  const allKeyPlacements = getLayoutForBuildSide(CONFIG);
  const { plateWidth, plateHeight, plateOffset } = calculatePlateDimensions(allKeyPlacements, CONFIG);

  return {
    CONFIG,
    allKeyPlacements,
    plateWidth,
    plateHeight,
    plateOffset,
  };
}

export function buildTopPlate(profileName?: string) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight, plateOffset } = buildWithConfig(profileName);
  return generateKeyboardPlate(allKeyPlacements, plateWidth, plateHeight, plateOffset, CONFIG);
}

export function buildBottomCase(profileName?: string) {
  const { CONFIG, plateWidth, plateHeight } = buildWithConfig(profileName);
  return generateBottomCase(plateWidth, plateHeight, CONFIG);
}

export function buildCompleteEnclosure(profileName?: string) {
  const { CONFIG } = buildWithConfig(profileName);
  const topPlateGeometry = buildTopPlate(profileName).translate([0, 0, CONFIG.topWallHeight + CONFIG.bottomThickness ]);
  const bottomCaseGeometry = buildBottomCase(profileName);
  return union(topPlateGeometry, bottomCaseGeometry);
}

export function build(generateStlFiles = false, profileName?: string) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight } = buildWithConfig(profileName);
  const activeProfile = profileName || process.env.KEYBOARD_PROFILE || DEFAULT_PROFILE;
  
  const outputFiles = [
    { fileName: "top", modelGeometry: buildTopPlate(profileName) },
    { fileName: "bottom", modelGeometry: buildBottomCase(profileName) },
    { fileName: "complete", modelGeometry: buildCompleteEnclosure(profileName) }
  ];

  outputFiles.forEach(async ({ fileName, modelGeometry }) => {
    writeFileSync(`./dist/${fileName}.scad`, modelGeometry.serialize({ $fn: CONFIG.openscadResolution }));
    if (generateStlFiles) {
      writeFileSync(`./dist/${fileName}.stl`, await modelGeometry.render({ $fn: CONFIG.openscadResolution }));
    }
  });

  console.log(`Generated SCAD files for profile: ${activeProfile}`);
  console.log(`  • Keyboard size: ${allKeyPlacements.length} keys`);
  console.log(`  • Plate dimensions: ${plateWidth.toFixed(1)}×${plateHeight.toFixed(1)}mm`);
  console.log(`  • Thickness: ${CONFIG.totalThickness}mm`);
}

/**
 * Lists all available keyboard profiles
 */
export function listProfiles() {
  console.log('Available keyboard profiles:');
  Object.entries(KEYBOARD_PROFILES).forEach(([name, profile]) => {
    const cols = profile.cols || 3;
    const rows = profile.rows || 5;
    const thumbKeys = profile.thumbKeys || 0;
    const buildSide = profile.buildSide || 'both';
    const switchType = profile.switchType || 'choc';
    
    const totalKeys = ((cols * rows) + thumbKeys) * (buildSide !== 'both' ? 1 : 2);
    
    const sideInfo = buildSide === 'both' ? '' : ` (${buildSide} side)`;
    const thumbInfo = thumbKeys > 0 ? `+ ${thumbKeys} thumbs` : '';
    const switchInfo = ` [${switchType}]`;
    console.log(`  • ${name}: ${totalKeys} keys ${cols}×${rows} ${thumbInfo}${sideInfo}${switchInfo}`);
  });
}
