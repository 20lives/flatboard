# Keyboard Profiles

This directory contains keyboard profile definitions. Each profile is a TypeScript file that exports a configuration object.

## Adding a New Keyboard

1. **Create a new file** in this directory (e.g., `my-keyboard.ts`)
2. **Export a `profile` constant** of type `ParameterProfile`:

```typescript
import type { ParameterProfile } from '../src/interfaces.js';

export const profile: ParameterProfile = {
  layout: {
    matrix: {
      rowLayout: [
        { start: 0, length: 5, offset: 0 },
        { start: 0, length: 5, offset: 2 },
        { start: 0, length: 4, offset: 5 },
      ],
    },
    edgeMargin: 8.0,
    baseDegrees: 10.0,
  },
  switch: {
    type: 'choc', // or 'mx'
  },
  thumb: {
    cluster: {
      keys: 3,
      spacing: 20.0,
      rotation: 15.0,
    },
    offset: {
      x: 25,
      y: 2,
    },
  },
  connectors: [
    {
      type: 'usbC',
      enabled: true,
      face: 'left',
      position: 0.5,
      clearance: 0.2,
    },
  ],
};
```

3. **Build it**:

```bash
bun run build -- my-keyboard
```

That's it! The filename (without `.ts`) becomes the profile name.

## Profile Structure

- **`layout.matrix.rowLayout`**: Array of row definitions with `start`, `length`, `offset`
- **`switch.type`**: Either `'choc'` or `'mx'`
- **`thumb.cluster`**: Thumb key configuration
- **`connectors`**: Array of connector definitions (USB-C, TRRS, etc.)
- **`enclosure`**: Plate thickness, wall dimensions, socket positions

See `split-36.ts` for a complete example.
