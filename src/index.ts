import { build, listProfiles } from './build.js';
import { profileExists, getProfileNames } from './profile-loader.js';

const args = process.argv.slice(2);
const [command, ...commandArgs] = args;

function handleBuild(profileName?: string, isDevMode = false, generateStl = false) {
  if (!profileName) {
    console.error('No profile specified.\n');
    console.log('Available profiles:');
    for (const name of getProfileNames()) {
      console.log(`  • ${name}`);
    }
    console.log('\nUsage: bun run build -- <profile>');
    process.exit(1);
  }

  if (!profileExists(profileName)) {
    console.error(`Profile '${profileName}' not found.\n`);
    console.log('Available profiles:');
    for (const name of getProfileNames()) {
      console.log(`  • ${name}`);
    }
    process.exit(1);
  }

  build(generateStl, profileName, isDevMode);
}

const commands: Record<string, () => void> = {
  list: () => listProfiles(),
  build: () => handleBuild(commandArgs[0], false, false),
  'build:dev': () => handleBuild(commandArgs[0], true, false),
  'build:stl': () => handleBuild(commandArgs[0], false, true),
  help: () =>
    console.log(`flatboard - Parameterized Keyboard Generator

Usage:
  bun run [command] [options]

Commands:
  build -- <profile>      Build the specified profile (SCAD files only)
  build:dev -- <profile>  Build with watch mode (rebuilds on file changes)
  build:stl -- <profile>  Build SCAD and STL files (ready for 3D printing)
  list                    List all available profiles
  help                    Show this help

Examples:
  bun run build -- split-36           # Build split-36 to dist/split-36-<hash>/
  bun run build:dev -- split-36       # Build to dist/ with watch mode, open dist/complete.scad in OpenSCAD
  bun run build:stl -- split-36       # Build SCAD + STL files to dist/split-36-<hash>/
  bun run list                        # List available profiles
  bun run clean                       # Remove all scad & stl artifacts

Output:
  build      → dist/<profile>-<hash>/{top,bottom,complete}.scad
  build:dev  → dist/{top,bottom,complete}.scad (live updates)
  build:stl  → dist/<profile>-<hash>/{top,bottom,complete}.{scad,stl}
`),
  undefined: () => {
    console.log('No command specified. Use "bun run help" for usage information');
    process.exit(1);
  },
};

const executeCommand = commands[command ?? 'undefined'];

if (executeCommand) {
  executeCommand();
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Use "bun src/index.ts help" for usage information');
  process.exit(1);
}
