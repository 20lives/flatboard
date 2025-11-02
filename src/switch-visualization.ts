import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { union, type ScadObject } from 'scad-js';
import type { KeyboardConfig, KeyPlacement } from './interfaces.js';
import { createCherryMX } from './assets/cherry-mx.js';
import { generateDSAKeycap, generateXDAKeycap } from './assets/keycap-generator.js';

function createPositionedKeycap(
  keyPlacement: KeyPlacement,
  profile: 'dsa' | 'xda',
  plateThickness: number,
  wallHeight: number,
  keycapColor: string,
): ScadObject {
  const { pos, rot } = keyPlacement;
  const keycap = profile === 'dsa' ? generateDSAKeycap() : generateXDAKeycap();

  return keycap
    .color(keycapColor, 0.9)
    .rotate_z(rot)
    .translate([pos.x, pos.y, plateThickness + wallHeight + 5]);
}

function createPositionedSwitch(keyPlacement: KeyPlacement, plateThickness: number, wallHeight: number): ScadObject {
  const { pos, rot } = keyPlacement;
  const switch3D = createCherryMX();

  return switch3D
    .rotate_z(rot)
    .translate([pos.x, pos.y, plateThickness + wallHeight + 10]);
}

export function createAllSwitchVisualizations(
  keyPlacements: KeyPlacement[],
  config: KeyboardConfig,
): ScadObject | null {
  const showSwitches = config?.output?.showSwitches === true;
  const showKeycaps = config?.output?.showKeycaps === true;
  const keycapProfile = config?.output?.keycapProfile;

  if (!showSwitches && !showKeycaps) {
    return null;
  }

  const plateThickness = config.enclosure.plate.bottomThickness;
  const wallHeight = config.enclosure.walls.height;

  // Use configured keycap color with default
  const keycapColor = config?.output?.colors?.keycaps ?? 'WhiteSmoke';

  const visualizations: ScadObject[] = [];

  if (showSwitches) {
    const switches = pipe(
      keyPlacements,
      A.map((placement) => createPositionedSwitch(placement, plateThickness, wallHeight)),
    );
    visualizations.push(...switches);
  }

  if (showKeycaps && keycapProfile && keycapProfile !== 'none') {
    const keycaps = pipe(
      keyPlacements,
      A.map((placement) => createPositionedKeycap(placement, keycapProfile, plateThickness, wallHeight, keycapColor)),
    );
    visualizations.push(...keycaps);
  }

  return visualizations.length > 0 ? union(...visualizations) : null;
}
