/**
 * Profile Registry
 *
 * This file imports all profiles from the profiles/ directory.
 * To add a new profile:
 * 1. Create a new .ts file in profiles/ (e.g., my-keyboard.ts)
 * 2. Export a 'profile' constant of type ParameterProfile
 * 3. Build with: bun run build -- my-keyboard
 *
 * The profile name is the filename without .ts extension.
 */

import type { ParameterProfile } from '../src/interfaces.js';
import { Glob } from 'bun';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Scan for all profile files using Bun.Glob
const glob = new Glob('*.ts');
const profileFiles = Array.from(glob.scanSync({ cwd: __dirname }))
  .filter((file) => file !== 'index.ts');

// Dynamically import all profiles
const profileEntries: [string, ParameterProfile][] = [];

for (const file of profileFiles) {
  const filePath = join(__dirname, file);
  const module = await import(filePath);
  const profileName = file.replace(/\.ts$/, '');

  if (module.profile) {
    profileEntries.push([profileName, module.profile]);
  } else {
    console.warn(`Profile file ${file} does not export 'profile'`);
  }
}

export const PROFILES = Object.fromEntries(profileEntries) as Record<string, ParameterProfile>;

export type ProfileName = keyof typeof PROFILES;
