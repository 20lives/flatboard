import { build, listProfiles } from './build.js';
import { DEFAULT_PROFILE } from './config.js';
import { profileExists } from './profile-utils.js';

const args = process.argv.slice(2);
const [command, ...commandArgs] = args;

function handleBuild(profileName?: string) {
  if (profileName && !profileExists(profileName)) {
    console.error(`Profile '${profileName}' not found. Use 'bun run list' to see available profiles.`);
    process.exit(1);
  }

  build(false, profileName);
}

const commands: Record<string, () => void> = {
  list: () => listProfiles(),
  build: () => handleBuild(commandArgs[0]),
  help: () =>
    console.log(`flatboard - Parameterized Keyboard Generator

Usage:
  bun run [command] [options]

Commands:
  build -- [profile]    Build with specified profile or default (${DEFAULT_PROFILE})
  list                  List all available profiles
  help                  Show this help

Examples:
  bun run build                       # Build with default profile (${DEFAULT_PROFILE})
  bun run build -- build ortho-36     # Build 36-key layout
  bun run list                        # List available profiles
  bun run clean                       # Remove all scad & stl artifacts

Output files are always: top.scad, bottom.scad, complete.scad
`),
  undefined: () => handleBuild(),
};

const executeCommand = commands[command ?? 'undefined'];

if (executeCommand) {
  executeCommand();
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Use "bun src/index.ts help" for usage information');
  process.exit(1);
}
