import { writeFileSync } from 'node:fs';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { type ScadObject, union } from 'scad-js';
import { generateBottomCase } from './bottom.js';
import { createConfig } from './config.js';
import { calculatePlateDimensions, getLayout } from './layout.js';
import { KEYBOARD_PROFILES } from './profile-loader.js';
import { generateKeyboardPlate } from './top.js';

function buildWithConfig(profileName: string) {
  const CONFIG = createConfig(profileName);

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

export function buildTopPlate(profileName: string) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight, plateOffset } = buildWithConfig(profileName);
  return generateKeyboardPlate(allKeyPlacements, plateWidth, plateHeight, plateOffset, CONFIG);
}

export function buildBottomCase(profileName: string) {
  const { CONFIG, plateWidth, plateHeight } = buildWithConfig(profileName);
  return generateBottomCase(plateWidth, plateHeight, CONFIG);
}

export function buildCompleteEnclosure(profileName: string) {
  const { CONFIG } = buildWithConfig(profileName);
  const topPlateGeometry = buildTopPlate(profileName).translate([0, 0, CONFIG.enclosure.plate.bottomThickness]);
  const bottomCaseGeometry = buildBottomCase(profileName);
  return union(topPlateGeometry, bottomCaseGeometry);
}

const createOutputFile = (fileName: string, modelGeometry: ScadObject) => ({
  fileName,
  modelGeometry,
});

function getTimestampHash(): string {
  const now = new Date();
  const timestamp = now.getTime().toString(36);
  return timestamp.slice(-6);
}

export function build(generateStlFiles = false, profileName: string, isDevMode = false) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight } = buildWithConfig(profileName);

  const OPENSCAD_RESOLUTION = CONFIG.output?.openscad?.resolution ?? 64;

  const outputDir = isDevMode ? './dist' : `./dist/${profileName}-${getTimestampHash()}`;

  if (!isDevMode) {
    const { mkdirSync } = require('node:fs');
    mkdirSync(outputDir, { recursive: true });
  }

  const outputFiles = [
    createOutputFile('top', buildTopPlate(profileName)),
    createOutputFile('bottom', buildBottomCase(profileName)),
    createOutputFile('complete', buildCompleteEnclosure(profileName)),
  ];

  const fileWritePromises = outputFiles.map(async (file) => {
    const scadPath = `${outputDir}/${file.fileName}.scad`;
    writeFileSync(scadPath, file.modelGeometry.serialize({ $fn: OPENSCAD_RESOLUTION }));

    const createdFiles = [scadPath];

    if (generateStlFiles) {
      const stlPath = `${outputDir}/${file.fileName}.stl`;
      writeFileSync(stlPath, await file.modelGeometry.render({ $fn: OPENSCAD_RESOLUTION }));
      createdFiles.push(stlPath);
    }

    return createdFiles;
  });

  Promise.all(fileWritePromises)
    .then((filePaths) => {
      const { statSync } = require('node:fs');
      const { basename } = require('node:path');

      const layoutMode = CONFIG.layout.mode === 'unibody' ? 'unibody' : 'split';
      console.log(`Generated files for profile: ${profileName} [${layoutMode}]`);
      console.log(`  • Keyboard size: ${allKeyPlacements.length} keys`);
      console.log(`  • Plate dimensions: ${plateWidth.toFixed(1)}×${plateHeight.toFixed(1)}mm`);
      console.log(`\n${outputDir}/`);

      const allFiles = filePaths.flat().sort();
      allFiles.forEach((filePath, index) => {
        const isLast = index === allFiles.length - 1;
        const prefix = isLast ? '└──' : '├──';
        const stats = statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`${prefix} ${basename(filePath)} (${sizeKB}K)`);
      });
    })
    .catch((error) => {
      console.error('Error generating files:', error);
    });
}

const formatProfileInfo = (name: string) => {
  const finalConfig = createConfig(name);
  const rowLayout = finalConfig.layout.matrix.rowLayout;
  const thumbKeys = finalConfig.thumb?.cluster?.keys ?? 0;
  const switchType = finalConfig.switch.type;
  const layoutMode = finalConfig.layout.mode;

  if (!rowLayout || rowLayout.length === 0) {
    return `  • ${name}: ERROR - No rowLayout defined`;
  }

  const matrixKeys = rowLayout.reduce((sum, row) => sum + row.length, 0);
  const layoutPattern = rowLayout.map((row) => `${row.start}:${row.length}`).join(',');
  const layoutDescription = `{${layoutPattern}}`;
  const singleSideKeys = matrixKeys + thumbKeys;
  const totalKeys = layoutMode === 'unibody' ? singleSideKeys * 2 : singleSideKeys;
  const thumbInfo = thumbKeys > 0 ? ` + ${thumbKeys} thumbs` : '';
  const switchInfo = ` [${switchType}]`;
  const modeInfo = ` (${layoutMode})`;

  return `  • ${name}: ${totalKeys} keys ${layoutDescription}${thumbInfo}${switchInfo}${modeInfo}`;
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
