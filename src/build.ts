import { writeFileSync } from 'node:fs';
import { union, type ScadObject } from 'scad-js';
import { generateBottomCase } from './bottom.js';
import { createConfig, DEFAULT_PROFILE, KEYBOARD_PROFILES } from './config.js';
import { calculatePlateDimensions, getLayout } from './layout.js';
import { generateKeyboardPlate } from './top.js';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

function buildWithConfig(profileName?: string) {
  const CONFIG = createConfig(profileName as keyof typeof KEYBOARD_PROFILES | undefined);

  const allKeyPlacements = getLayout(CONFIG);

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
  const topPlateGeometry = buildTopPlate(profileName).translate([0, 0, CONFIG.enclosure.plate.bottomThickness]);
  const bottomCaseGeometry = buildBottomCase(profileName);
  return union(topPlateGeometry, bottomCaseGeometry);
}

const createOutputFile = (fileName: string, modelGeometry: ScadObject) => ({
  fileName,
  modelGeometry,
});

export function build(generateStlFiles = false, profileName?: string) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight } = buildWithConfig(profileName);
  const activeProfile = profileName || process.env.KEYBOARD_PROFILE || DEFAULT_PROFILE;

  const OPENSCAD_RESOLUTION = CONFIG.output?.openscad?.resolution ?? 64;

  const outputFiles = [
    createOutputFile('top', buildTopPlate(profileName)),
    createOutputFile('bottom', buildBottomCase(profileName)),
    createOutputFile('complete', buildCompleteEnclosure(profileName)),
  ];

  const fileWritePromises = outputFiles.map(async (file) => {
    const scadPath = `./dist/${file.fileName}.scad`;
    writeFileSync(scadPath, file.modelGeometry.serialize({ $fn: OPENSCAD_RESOLUTION }));

    if (generateStlFiles) {
      const stlPath = `./dist/${file.fileName}.stl`;
      writeFileSync(stlPath, await file.modelGeometry.render({ $fn: OPENSCAD_RESOLUTION }));
    }

    return scadPath;
  });

  Promise.all(fileWritePromises)
    .then(() => {
      console.log(`Generated SCAD files for profile: ${activeProfile}`);
      console.log(`  • Keyboard size: ${allKeyPlacements.length} keys`);
      console.log(`  • Plate dimensions: ${plateWidth.toFixed(1)}×${plateHeight.toFixed(1)}mm`);
    })
    .catch((error) => {
      console.error('Error generating files:', error);
    });
}

/**
 * Lists all available keyboard profiles
 */
// Pure function to format profile info
const formatProfileInfo = (name: string) => {
  const finalConfig = createConfig(name as keyof typeof KEYBOARD_PROFILES);
  const rowLayout = finalConfig.layout.matrix.rowLayout;
  const thumbKeys = finalConfig.thumb?.cluster?.keys ?? 0;
  const switchType = finalConfig.switch.type;

  if (!rowLayout || rowLayout.length === 0) {
    return `  • ${name}: ERROR - No rowLayout defined`;
  }

  const matrixKeys = rowLayout.reduce((sum, row) => sum + row.length, 0);
  const layoutPattern = rowLayout.map((row) => `${row.start}:${row.length}`).join(',');
  const layoutDescription = `{${layoutPattern}}`;
  const totalKeys = matrixKeys + thumbKeys;
  const thumbInfo = thumbKeys > 0 ? ` + ${thumbKeys} thumbs` : '';
  const switchInfo = ` [${switchType}]`;

  return `  • ${name}: ${totalKeys} keys ${layoutDescription}${thumbInfo}${switchInfo}`;
};

export function listProfiles() {
  console.log('Available keyboard profiles:');

  const profileInfos = pipe(Object.keys(KEYBOARD_PROFILES), A.map(formatProfileInfo));

  pipe(
    profileInfos,
    A.map((info) => {
      console.log(info);
      return info;
    }),
  );
}
