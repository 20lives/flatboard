export type Point2D = { x: number; y: number };
export type KeyPlacement = { pos: Point2D; rot: number };

export interface RowLayoutItem {
  start: number; // Starting grid position for this row
  length: number; // Number of keys in this row
  offset?: number; // Column stagger offset (optional, defaults to 0)
  thumbAnchor?: number; // Optional thumb anchor key index for this row
}

export interface MatrixConfig {
  rowLayout: RowLayoutItem[];
  spacing: number;
}

export interface LayoutConfig {
  matrix: MatrixConfig;
  edgeMargin: number;
  baseDegrees: number;
  mode: 'split' | 'unibody';
  centerGap?: number;
}

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

export interface SiliconPadSocket {
  shape: 'round' | 'square';
  size: {
    radius?: number; // For round sockets
    width?: number; // For square sockets
    height?: number; // For square sockets
  };
  depth: number; // Socket depth into bottom plate
  position: {
    anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    offset: Point2D; // Offset from anchor position
  };
  reinforcement?: {
    thickness?: number;
    height?: number;
  };
}

export interface BottomPatternConfig {
  type: 'honeycomb' | 'circles' | 'square';
  cellSize: number;
  wallThickness: number;
  margin: number;
}

export interface EnclosureConfig {
  plate: {
    topThickness: number;
    bottomThickness: number;
  };
  walls: {
    thickness: number;
    height: number;
  };
  bottomPadsSockets?: SiliconPadSocket[];
  bottomPattern?: BottomPatternConfig;
}

export interface ConnectorConfig {
  type: string;
  enabled: boolean;
  face: 'top' | 'bottom' | 'left' | 'right';
  position: number;
  clearance: number;
}

export interface OutputConfig {
  openscad: {
    resolution: number;
  };
}

export interface KeyboardConfig {
  layout: LayoutConfig;
  switch: SwitchConfig;
  thumb?: ThumbConfig;
  enclosure: EnclosureConfig;
  connectors?: ConnectorConfig[];
  output: OutputConfig;
}

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

export interface ConnectorSpec {
  description: string;
  geometry: {
    type: 'pill' | 'circle' | 'square';
    radius?: number;
    circleRadius?: number;
    centerDistance?: number;
    width?: number;
    height?: number;
    depth?: number;
  };
}

export interface ParameterProfile {
  layout?: {
    matrix?: {
      rowLayout?: RowLayoutItem[];
    };
    edgeMargin?: number;
    baseDegrees?: number;
    mode?: 'split' | 'unibody';
    centerGap?: number;
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
    bottomPadsSockets?: SiliconPadSocket[];
    bottomPattern?: BottomPatternConfig;
  };
  connectors?: ConnectorConfig[];
  output?: {
    openscad?: {
      resolution?: number;
    };
  };
}
