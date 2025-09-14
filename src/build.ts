import { writeFileSync } from 'node:fs';
import { union } from 'scad-js';
import { generateBottomCase } from './bottom.js';
import { createConfig, createConfigSafe, DEFAULT_PROFILE, KEYBOARD_PROFILES } from './config.js';
import { calculatePlateDimensions, getLayout } from './layout.js';
import { generateKeyboardPlate } from './top.js';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

/**
 * Builds keyboard components with the specified configuration
 */
function buildWithConfig(profileName?: string) {
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
    CONFIG.enclosure.plate.bottomThickness,
  ]);
  const bottomCaseGeometry = buildBottomCase(profileName);
  return union(topPlateGeometry, bottomCaseGeometry);
}

// Pure function to create output file definition
const createOutputFile = (fileName: string, modelGeometry: any) => ({
  fileName,
  modelGeometry,
});

// Enhanced file writing with fp-ts TaskEither
type FileWriteParams = {
  fileName: string;
  modelGeometry: any;
  resolution: number;
  generateStlFiles: boolean;
};

const writeScadFile = ({ fileName, modelGeometry, resolution }: Omit<FileWriteParams, 'generateStlFiles'>): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    async () => {
      const content = modelGeometry.serialize({ $fn: resolution });
      writeFileSync(`./dist/${fileName}.scad`, content);
      return `./dist/${fileName}.scad`;
    },
    (reason) => new Error(`Failed to write SCAD file ${fileName}: ${String(reason)}`)
  );

const writeStlFile = ({ fileName, modelGeometry, resolution }: Omit<FileWriteParams, 'generateStlFiles'>): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    async () => {
      const content = await modelGeometry.render({ $fn: resolution });
      writeFileSync(`./dist/${fileName}.stl`, content);
      return `./dist/${fileName}.stl`;
    },
    (reason) => new Error(`Failed to write STL file ${fileName}: ${String(reason)}`)
  );

const writeOutputFile = (params: FileWriteParams): TE.TaskEither<Error, string[]> => {
  const scadTask = writeScadFile(params);
  
  if (params.generateStlFiles) {
    const stlTask = writeStlFile(params);
    return pipe(
      TE.sequenceArray([scadTask, stlTask])
    );
  }
  
  return pipe(
    scadTask,
    TE.map(path => [path])
  );
};

// Enhanced build function with fp-ts TaskEither
export const buildSafe = (generateStlFiles = false, profileName?: string): TE.TaskEither<Error, string[]> => {
  return pipe(
    createConfigSafe(profileName),
    TE.fromEither,
    TE.chain((CONFIG) => {
      const allKeyPlacements = getLayout(CONFIG);
      const { plateWidth, plateHeight } = calculatePlateDimensions(allKeyPlacements, CONFIG);
      const activeProfile = profileName || process.env.KEYBOARD_PROFILE || DEFAULT_PROFILE;

      const outputFiles = [
        { fileName: 'top', modelGeometry: buildTopPlate(profileName) },
        { fileName: 'bottom', modelGeometry: buildBottomCase(profileName) },
        { fileName: 'complete', modelGeometry: buildCompleteEnclosure(profileName) },
      ];

      const writeParams: FileWriteParams[] = outputFiles.map(file => ({
        ...file,
        resolution: CONFIG.output.openscad.resolution,
        generateStlFiles
      }));

      return pipe(
        writeParams,
        A.map(writeOutputFile),
        TE.sequenceArray,
        TE.map(filePathArrays => filePathArrays.flat()),
        TE.tap(() => TE.rightTask(T.of({
          log: () => {
            console.log(`Generated SCAD files for profile: ${activeProfile}`);
            console.log(`  • Keyboard size: ${allKeyPlacements.length} keys`);
            console.log(`  • Plate dimensions: ${plateWidth.toFixed(1)}×${plateHeight.toFixed(1)}mm`);
          }
        })))
      );
    })
  );
};

// Backward compatible build function with proper logging
export function build(generateStlFiles = false, profileName?: string) {
  const { CONFIG, allKeyPlacements, plateWidth, plateHeight } = buildWithConfig(profileName);
  const activeProfile = profileName || process.env.KEYBOARD_PROFILE || DEFAULT_PROFILE;

  const outputFiles = [
    createOutputFile('top', buildTopPlate(profileName)),
    createOutputFile('bottom', buildBottomCase(profileName)),
    createOutputFile('complete', buildCompleteEnclosure(profileName)),
  ];

  // Use traditional Promise.all for compatibility
  const fileWritePromises = outputFiles.map(async (file) => {
    const scadPath = `./dist/${file.fileName}.scad`;
    writeFileSync(scadPath, file.modelGeometry.serialize({ $fn: CONFIG.output.openscad.resolution }));
    
    if (generateStlFiles) {
      const stlPath = `./dist/${file.fileName}.stl`;
      writeFileSync(stlPath, await file.modelGeometry.render({ $fn: CONFIG.output.openscad.resolution }));
    }
    
    return scadPath;
  });

  Promise.all(fileWritePromises).then(() => {
    console.log(`Generated SCAD files for profile: ${activeProfile}`);
    console.log(`  • Keyboard size: ${allKeyPlacements.length} keys`);
    console.log(`  • Plate dimensions: ${plateWidth.toFixed(1)}×${plateHeight.toFixed(1)}mm`);
  }).catch(error => {
    console.error('Error generating files:', error);
  });
}

/**
 * Lists all available keyboard profiles
 */
// Pure function to format profile info
const formatProfileInfo = (name: string) => {
  const finalConfig = createConfig(name);
  const rowLayout = finalConfig.layout.matrix.rowLayout;
  const thumbKeys = finalConfig.thumb.cluster.keys;
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
  
  const profileInfos = pipe(
    Object.keys(KEYBOARD_PROFILES),
    A.map(formatProfileInfo)
  );
  
  // Side effect: logging each profile info
  pipe(
    profileInfos,
    A.map(info => {
      console.log(info);
      return info;
    })
  );
}
