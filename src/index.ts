import { build, listProfiles } from './build.js';
import { ProfileManager } from './profile-utils.js';
import { DEFAULT_PROFILE } from './config.js';

// Command line argument parsing
const args = process.argv.slice(2);
const [command, ...commandArgs] = args;

// Helper function to handle profile building
function handleBuild(profileName?: string) {
  if (profileName && !ProfileManager.profileExists(profileName)) {
    console.error(`Profile '${profileName}' not found. Use 'bun run list' to see available profiles.`);
    process.exit(1);
  }

  build(false, profileName);
}

switch (command) {
  case 'list':
    listProfiles();
    break;

  case 'build':
    handleBuild(commandArgs[0]);
    break;

  case 'help':
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
`);
    break;

  case undefined:
    handleBuild(); // Build with default profile when no command specified
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.log('Use "bun src/index.ts help" for usage information');
    process.exit(1);
}
