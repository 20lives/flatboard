/**
 * TypeScript interfaces and types for the keyboard configuration system
 */

// Basic types
export type Point2D = { x: number; y: number };
export type KeyPlacement = { pos: Point2D; rot: number };

// Row layout configuration
export interface RowLayoutItem {
  start: number; // Starting grid position for this row
  length: number; // Number of keys in this row
  offset?: number; // Column stagger offset (optional, defaults to 0)
}

// Matrix layout configuration
export interface MatrixConfig {
  rowLayout: RowLayoutItem[];
  pitch: number;
}

// Layout configuration
export interface LayoutConfig {
  matrix: MatrixConfig;
  spacing: {
    centerGap: number;
    edgeMargin: number;
  };
  build: {
    side: 'left' | 'right' | 'both';
  };
  rotation: {
    baseDegrees: number;
  };
}

// Switch configuration
export interface SwitchConfig {
  type: 'choc' | 'mx';
  cutout: {
    size: number;
    thinZone: number;
  };
  plate: {
    thickness: number;
    totalThickness: number;
  };
}

// Thumb cluster configuration
export interface ThumbConfig {
  cluster: {
    keys: number;
    pitch: number;
    vertical: boolean;
    rotation: number;
  };
  offset: Point2D;
  perKey: {
    rotations: number[];
    offsets: Point2D[];
  };
}

// Enclosure configuration
export interface EnclosureConfig {
  plate: {
    thickness: number;
  };
  walls: {
    thickness: number;
    top: {
      height: number;
    };
    bottom: {
      height: number;
      thickness: number;
    };
  };
  frame: {
    wallThickness: number;
    scaleFactor: number;
  };
  skin: {
    reductionHeight: number;
    thickness: number; // computed
  };
}

// Mounting configuration
export interface MountingConfig {
  corner: {
    radius: number;
    insetDivisor: number;
    offsetFactor: number;
    rotations: readonly [number, number, number, number];
    inset: number; // computed
    offset: number; // computed
    cutoutWidth: number; // computed
    cutoutOffset: number; // computed
  };
  insert: {
    height: number;
    radius: number;
    centerZ: number; // computed
  };
  screw: {
    diameter: number;
    radius: number;
    head: {
      radius: number;
      height: number;
    };
  };
}

// Tolerances configuration
export interface TolerancesConfig {
  general: number;
  extrusion: number;
  generalHeight: number; // computed
  extrusionHeight: number; // computed
  doubleGeneralHeight: number; // computed
}

// Connector configuration
export interface ConnectorConfig {
  type: string; // Will be typed more specifically in connectors.ts
  enabled: boolean;
  face: 'top' | 'bottom' | 'left' | 'right';
  position: number;
  clearance: number;
}

// Output configuration
export interface OutputConfig {
  openscad: {
    resolution: number;
  };
}

// Computed values
export interface ComputedConfig {
  manufacturingScaleMargin: number;
  frameStructureHeight: number;
  maximumKeySize: number;
  cornerInset: number;
  topWallCenterZ: number;
  bottomWallCenterZ: number;
}

// Complete keyboard configuration interface
export interface KeyboardConfig {
  layout: LayoutConfig;
  switch: SwitchConfig;
  thumb: ThumbConfig;
  enclosure: EnclosureConfig;
  mounting: MountingConfig;
  tolerances: TolerancesConfig;
  connectors: ConnectorConfig[];
  output: OutputConfig;
  computed: ComputedConfig;
}

// Switch specification interface for switch definitions
export interface SwitchSpec {
  description: string;
  switch: {
    cutout: {
      size: number;
      thinZone: number;
    };
    plate: {
      thickness: number;
      totalThickness: number;
    };
  };
  layout: {
    matrix: {
      pitch: number;
    };
  };
}

// Connector specification interface for connector definitions
export interface ConnectorSpec {
  description: string;
  geometry: {
    type: 'pill' | 'circle';
    radius?: number;
    circleRadius?: number;
    centerDistance?: number;
    depth?: number;
  };
}

// Forward declaration for BASE_PARAMETERS type
// This will be properly typed when BASE_PARAMETERS is imported
export type ParameterProfile = any; // Will be updated in config.ts
