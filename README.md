# flatboard

Generate 3D-printable split keyboard cases from TypeScript configuration files.

## What it does

Takes keyboard layout parameters and outputs OpenSCAD files for:
- Top plate with switch cutouts and mounting points
- Bottom case with electronics cavity
- Complete assembly preview

Supports Choc and MX switches, configurable connectors (USB-C, TRRS), and arbitrary row layouts.

## Install

```bash
git clone git@github.com:20lives/flatboard.git
cd flatboard
bun install
```

## Usage

Build the default profile:
```bash
bun run build
```

List available profiles:
```bash
bun run list
```

Build a specific profile:
```bash
bun run build -- ortho-36-mx
```

Output files go to `dist/`:
- `top.scad` - top plate
- `bottom.scad` - bottom case
- `complete.scad` - assembled view

## Configuration

Profiles are defined in `src/keyboard-profiles.ts`. Copy an existing profile to start:

```typescript
'my-layout': {
  layout: {
    matrix: {
      rowLayout: [
        { start: 0, length: 5, offset: 0 },
        { start: 0, length: 5, offset: 2 },
        { start: 0, length: 4, offset: 5 },
      ],
    },
    spacing: {
      centerGap: 30.0,
    },
  },
  switch: {
    type: 'choc',
  },
  thumb: {
    cluster: {
      keys: 3,
      anchorIndex: 0,
      rotation: 10,
    },
  },
  connectors: [
    {
      type: 'usbC',
      face: 'top',
      position: 0.5,
      enabled: true,
      clearance: 0.2,
    },
  ],
}
```

### Row layout system

Each row is defined by three parameters:
- `start` - starting column position (can be negative)
- `length` - number of keys in the row
- `offset` - column stagger in millimeters

### Connectors

Connector `face` can be `top`, `bottom`, `left`, or `right`. The `position` parameter (0-1) determines placement along that edge.

Available connector types are defined in `src/connector-specs.ts`.

## Included profiles

- `split-36` - 36-key split (15 + 3 thumb per hand), Choc switches
- `macropad-3x3` - 9-key macropad (3×3 grid), Choc switches
- `test-single-choc` - Single key test configuration

## Technical notes

Built with:
- TypeScript for configuration and logic
- scad-js for OpenSCAD generation
- fp-ts for functional patterns
- Bun as runtime

The coordinate system is rotated 90° clockwise relative to OpenSCAD's default axes. Connector face mapping accounts for this.

## Assembly

Files are designed for FDM printing without supports. The top and bottom pieces use M3 heat inserts and screws for assembly.

## License

MIT
