import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { union } from 'scad-js';

import { getLayoutForBuildSide, calculatePlateDimensions } from './layout.js';
import { generateKeyboardPlate } from './top.js';
import { generateBottomCase } from './bottom.js';
import { createConfig, KEYBOARD_PROFILES, DEFAULT_PROFILE } from './config.js';
import { writeFileSyncSafe } from './utils.js';

/**
 * Builds keyboard components with the specified configuration
 */
function buildWithConfig(profileName?: string) {
  const CONFIG = createConfig(profileName as keyof typeof KEYBOARD_PROFILES);

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
  const topPlateGeometry = buildTopPlate(profileName).translate([
    0,
    0,
    CONFIG.enclosure.walls.top.height + CONFIG.enclosure.walls.bottom.thickness,
  ]);
  const bottomCaseGeometry = buildBottomCase(profileName);
  return union(topPlateGeometry, bottomCaseGeometry);
}

export function build(generateStlFiles = false, profileName?: string) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight } = buildWithConfig(profileName);
  const activeProfile = profileName || process.env.KEYBOARD_PROFILE || DEFAULT_PROFILE;

  const outputFiles = [
    { fileName: 'top', modelGeometry: buildTopPlate(profileName) },
    { fileName: 'bottom', modelGeometry: buildBottomCase(profileName) },
    { fileName: 'complete', modelGeometry: buildCompleteEnclosure(profileName) },
  ];

  outputFiles.forEach(async ({ fileName, modelGeometry }) => {
    writeFileSyncSafe(`./dist/${fileName}.scad`, modelGeometry.serialize({ $fn: CONFIG.output.openscad.resolution }));
    if (generateStlFiles) {
      writeFileSyncSafe(`./dist/${fileName}.stl`, await modelGeometry.render({ $fn: CONFIG.output.openscad.resolution }));
    }
  });

  console.log(`Generated SCAD files for profile: ${activeProfile}`);
  console.log(`  • Keyboard size: ${allKeyPlacements.length} keys`);
  console.log(`  • Plate dimensions: ${plateWidth.toFixed(1)}×${plateHeight.toFixed(1)}mm`);
  console.log(`  • Thickness: ${CONFIG.switch.plate.totalThickness}mm`);
}

/**
 * Lists all available keyboard profiles
 */
export function listProfiles() {
  console.log('Available keyboard profiles:');
  Object.entries(KEYBOARD_PROFILES).forEach(([name, _profile]) => {
    // Get the final config to access merged rowLayout
    const finalConfig = createConfig(name as keyof typeof KEYBOARD_PROFILES);
    const rowLayout = finalConfig.layout.matrix.rowLayout;
    const thumbKeys = finalConfig.thumb.cluster.keys;
    const buildSide = finalConfig.layout.build.side;
    const switchType = finalConfig.switch.type;

    if (!rowLayout || rowLayout.length === 0) {
      console.log(`  • ${name}: ERROR - No rowLayout defined`);
      return;
    }

    // Sum all row lengths for total matrix keys
    const matrixKeys = rowLayout.reduce((sum, row) => sum + row.length, 0);

    // Create layout description showing start:length patterns
    const layoutPattern = rowLayout.map((row) => `${row.start}:${row.length}`).join(',');
    const layoutDescription = `{${layoutPattern}}`;

    const totalKeys = (matrixKeys + thumbKeys) * (buildSide !== 'both' ? 1 : 2);

    const sideInfo = buildSide === 'both' ? '' : ` (${buildSide} side)`;
    const thumbInfo = thumbKeys > 0 ? ` + ${thumbKeys} thumbs` : '';
    const switchInfo = ` [${switchType}]`;
    console.log(`  • ${name}: ${totalKeys} keys ${layoutDescription}${thumbInfo}${sideInfo}${switchInfo}`);
  });
}
