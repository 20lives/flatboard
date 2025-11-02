import {
  cube,
  cylinder,
  translate,
  difference,
  hull,
  union,
  ScadObject,
} from 'scad-js';

export function createCherryMX(): ScadObject {
  const stem = createStem().color('#8B4513');
  const topHousing = createTopHousing().color('#808080');
  const bottomHousing = createBottomHousing().color('#228B22');
  const bottomGuides = createBottomGuides().color('#006400');
  const pins = createPins().color('#FF8C00');

  return union( stem, topHousing, bottomHousing, bottomGuides, pins );
}

function createStem(): ScadObject {
  const lrTab = cube([1.35, 4.5, 3.62]).translate_z(-3.62 / 2);
  const fbTab = cube([4.5, 1.15, 3.62]).translate_z(-3.62 / 2);
  const base = cube([7.2, 5.56, 4]).translate_z(-5.62);

  return union(lrTab, fbTab, base);
}

function createTopHousing(): ScadObject {
  const topShape = hull(
    cube([9.87, 10.62, 0.1]).translate_z( -4),
    cube([14.58, 14.58, 0.1]).translate_z(-4 - 5.2),
  );

  const ledCylinder = cylinder(6, 3 / 2).translate([0, -4.7, -6]);
  const ledCube = cube([8, 4, 5]).translate([0, -5.5, -6]);

  return difference(topShape, ledCylinder, ledCube);
}

function createBottomHousing(): ScadObject {
  const mainBody = hull(
    cube([13.98, 13.98, 0.1]).translate_z(-4 - 5.3),
    cube([13.98, 13.98, 0.1]).translate_z( -4 - 5.3 - 2.2),
    cube([12.74, 13.6, 0.1]).translate_z( -4 - 5.3 - 5.5),
  );

  const tabs = difference(
    cube([15.64, 15.64, 0.82]).translate_z(-4 - 5.3 - 0.82 / 2),
    cube([5.64, 20, 0.82 + 2]).translate_z(-4 - 5.3 - 0.82 / 2),
    cube([20, 11.64, 0.82 + 2]).translate_z(-4 - 5.3 - 0.82 / 2),
  ).color('#000000');

  const plateSnapOn = createPlateSnapOn().color('#FFFFFF');

  return union(mainBody, tabs, plateSnapOn);
}

function createPlateSnapOn(): ScadObject {
  const top = cube([1.82, 16.33, 0.82]).translate_z(-4 - 5.3 - 0.82 / 2);

  const bottomShape = hull(
    cube([3.65, 14, 0.1]).translate_z(-4 - 5.3 - 0.82 / 2 - 1.76),
    cube([3.65, 14.74, 0.1]).translate_z(-4 - 5.3 - 0.82 / 2 - 2.2),
    cube([3.65, 14, 0.1]).translate_z(-4 - 5.3 - 0.82 / 2 - 2.89),
  );

  const bottomCut = cube([2.2, 20, 4]).translate_z(-4 - 5.3 - 0.82 / 2 - 1.76);

  const bottom = difference(bottomShape, bottomCut);

  return union(top, bottom);
}

function createBottomGuides(): ScadObject {
  const centerCylinder = cylinder(2, 3.85 / 2).translate_z(-4 - 5.3 - 5.5 - 2 / 2);
  const centerCylinderTapered = cylinder(1, 2.8 / 2, 3.85 / 2).translate_z(-4 - 5.3 - 5.5 - 2 - 1 / 2);
  const leftPin = cylinder(2, 1.6 / 2).translate([-4.95, 0, -4 - 5.3 - 5.5 - 2 / 2]);
  const leftPinTapered = cylinder(1, 1 / 2, 1.6 / 2).translate([-4.95, 0, -4 - 5.3 - 5.5 - 2 - 1 / 2]);
  const rightPin = cylinder(2, 1.6 / 2).translate([4.95, 0, -4 - 5.3 - 5.5 - 2 / 2]);
  const rightPinTapered = cylinder(1, 1 / 2, 1.6 / 2).translate([4.95, 0, -4 - 5.3 - 5.5 - 2 - 1 / 2]);

  return union(
    centerCylinder,
    centerCylinderTapered,
    leftPin,
    leftPinTapered,
    rightPin,
    rightPinTapered,
  );
}

function createPins(): ScadObject {
  const pin1 = cube([0.86, 0.2, 3.1]).translate([-3.77, 2.7, -4 - 5.3 - 5.5 - 3.1 / 2]);
  const pin2 = cube([0.86, 0.2, 3.1]).translate([2.7, 5.2, -4 - 5.3 - 5.5 - 3.1 / 2]);

  return union(pin1, pin2);
}
