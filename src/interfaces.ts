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
  thumbAnchor?: number; // Optional thumb anchor key index for this row
}

// Matrix layout configuration
export interface MatrixConfig {
  rowLayout: RowLayoutItem[];
  spacing: number;
}

// Layout configuration
export interface LayoutConfig {
  matrix: MatrixConfig;
  spacing: {
    edgeMargin: number;
  };
  rotation: {
    baseDegrees: number;
  };
}

// Switch configuration
export interface SwitchConfig {
  type: 'choc' | 'mx';
  cutout: {
    inner: number;
    outer: number;
    height: number;
    startHeight: number;
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
    spacing?: number;
    rotation?: number;
  };
  offset: Point2D;
  perKey?: {
    rotations: number[];
    offsets: Point2D[];
  };
}

// Enclosure configuration
export interface EnclosureConfig {
  plate: {
    topThickness: number;       // Top switch mounting plate thickness
    bottomThickness: number;    // Bottom case floor thickness
  };
  walls: {
    thickness: number;          // Perimeter wall thickness
    height: number;             // Wall height extending down from top plate
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

// Complete keyboard configuration interface
export interface KeyboardConfig {
  layout: LayoutConfig;
  switch: SwitchConfig;
  thumb: ThumbConfig;
  enclosure: EnclosureConfig;
  tolerances: TolerancesConfig;
  connectors: ConnectorConfig[];
  output: OutputConfig;
}

// Switch specification interface for switch definitions
export interface SwitchSpec {
  description: string;
  switch: {
    cutout: {
      inner: number;
      outer: number;
      height: number;
      startHeight: number;
    };
    plate: {
      thickness: number;
      totalThickness: number;
    };
  };
  layout: {
    matrix: {
      spacing: number;
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

// Parameter profile type for partial configuration overrides
export interface ParameterProfile {
  layout?: {
    matrix?: {
      rowLayout?: RowLayoutItem[];
      spacing?: number;
    };
    spacing?: {
      edgeMargin?: number;
    };
    rotation?: {
      baseDegrees?: number;
    };
  };
  switch?: {
    type?: 'choc' | 'mx';
  };
  thumb?: {
    cluster?: {
      keys?: number;
      spacing?: number;
      rotation?: number;
    };
    offset?: Point2D;
    perKey?: {
      rotations?: number[];
      offsets?: Point2D[];
    };
  };
  enclosure?: {
    plate?: {
      topThickness?: number;
      bottomThickness?: number;
    };
    walls?: {
      thickness?: number;
      height?: number;
    };
  };
  tolerances?: {
    general?: number;
    extrusion?: number;
  };
  connectors?: ConnectorConfig[];
  output?: {
    openscad?: {
      resolution?: number;
    };
  };
}
