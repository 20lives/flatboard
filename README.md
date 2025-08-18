# flatboard

## 🎯 **Build Your Dream Keyboard with Just JavaScript!**

**No 3D modeling knowledge required** - Design and generate professional split keyboards using simple JavaScript configuration. Perfect your layout, add connectors, and get ready-to-print files in minutes!

✨ **From idea to 3D-printable keyboard in 3 steps:**
1. **Configure** - Adjust layout, switches, and connectors with simple JS objects
2. **Generate** - Run one command to create professional SCAD files  
3. **Print** - Get manufacturing-ready files for your custom keyboard

---

**flatboard** is a powerful **TypeScript-based** keyboard generator that makes custom split keyboards accessible to everyone. Whether you're a developer, maker, or keyboard enthusiast, create your perfect typing experience without touching CAD software!

## 🚀 **Why Choose flatboard?**

### 🎮 **For Beginners**
- **🚀 Zero CAD Experience Needed** - Configure with familiar JavaScript syntax
- **📝 Copy & Paste Ready** - Start with working examples, modify to taste
- **⚡ Instant Results** - See your changes in generated 3D files immediately
- **🎯 Guided Configuration** - Clear parameter names and helpful comments

### 🔥 **For Power Users**  
- **🔧 Infinite Customization** - Every dimension, angle, and curve is configurable
- **🔌 Pro Connector System** - USB-C, TRRS, custom connectors anywhere you want
- **⌨️ Smart Split Layouts** - Automatic left/right mirroring with perfect geometry
- **🔩 Professional Assembly** - Heat insert mounting system for durable builds

### 💎 **What You Get**
- **📐 Mathematical Precision** - Perfect geometry, every time
- **🎯 Manufacturing Ready** - Optimized for 3D printing with no supports needed
- **⚡ Multiple Switch Support** - Choc low-profile or Cherry MX compatibility  
- **🛠️ Complete Assembly** - Top plate, bottom case, and mounting hardware

## 🛠️ Dependencies

- **SCAD-JS** - TypeScript-to-OpenSCAD transpiler
- **Bun** - Fast runtime and build system

## 🚀 **Get Started in 2 Minutes!**

### **Step 1: Setup** ⚡
```bash
git clone git@github.com:20lives/flatboard.git
cd flatboard
bun install
```

### **Step 2: Your First Keyboard** 🎯
```bash
# Generate your first keyboard (default 36-key split)
bun run build

# 🎉 Done! Check the dist/ folder for your 3D files
```

### **Step 3: Explore & Customize** 🔥
```bash
# See all the cool layouts we've made for you
bun run list

# Try different switches and layouts
bun run build -- ortho-36-mx
bun run build -- ortho-4x10

# Clean up when experimenting
bun run clean
```

> **💡 Pro tip:** Start with a built-in profile, then modify it step by step. You'll be designing custom keyboards in minutes!

### Available Profiles

```bash
bun run list
```

**🎯 Ready-to-Use Profiles:**
- `ortho-36` - 🔥 **Most Popular** - 36-key split with Choc switches
- `ortho-36-mx` - 💪 **Cherry MX** - Same layout, bigger switches
- `ortho-4x10` - 📱 **Compact** - 40-key single-side layout

**🧪 Experimental Profiles:**
- `test-single-choc` - Single key for testing
- `test-single-mx` - Single key with MX switch
- `test-multi-connectors` - **Demo:** USB-C + TRRS connectors
- `test-custom-rows` - **Demo:** Custom row layouts with rowLayout system
- `test-advanced-layout` - **Demo:** Advanced grid positioning with start/length/offset

> **🚀 New to split keyboards?** Start with `ortho-36` - it's the sweet spot of ergonomics and usability!

## 🎨 **Create Your Perfect Keyboard** 

### **It's Just JavaScript!** ✨

Want a wider split? More thumb keys? USB-C on the side? **No problem!** Just copy a profile and modify the values you want to change. Here's how easy it is:

```typescript
// Add this to src/keyboard-profiles.ts - that's it!
'my-dream-keyboard': {
  layout: {
    matrix: {
      rowLayout: [             // 🎯 Precise control over each row!
        { start: 0, length: 4, offset: 2 },  // Row 0: 4 keys with column stagger
        { start: 0, length: 5, offset: 0 },  // Row 1: 5 keys, no stagger  
        { start: 1, length: 4, offset: 1 },  // Row 2: 4 keys, offset right
        { start: 0, length: 3, offset: 3 },  // Row 3: 3 keys with stagger
      ],
    },
    spacing: {
      centerGap: 40.0,        // 🔄 Wider split for comfort
    },
    rotation: {
      baseDegrees: -15.0,     // 📐 Tilt it how you like
    },
  },
  switch: {
    type: 'mx',               // 🔘 Cherry MX? Choc? Your choice!
  },
  thumb: {
    cluster: {
      keys: 4,                // 👍 More thumb keys = more shortcuts
    },
  },
  connectors: [
    {
      type: 'usbC',           // 🔌 USB-C on the side
      face: 'left',           // 📍 Put it anywhere!
      position: 0.7,          // 🎯 Exact positioning
    },
    {
      type: 'trrs',           // 🎧 Want audio? Add TRRS!
      face: 'right',
      position: 0.3,
    },
  ],
},
```

**🎉 That's it!** Run `bun run build -- my-dream-keyboard` and you've got a custom keyboard designed exactly how you want it!

### **What You Get** 📦

**3 Professional Files Ready for 3D Printing:**
- `dist/top.scad` - 🔝 **Top plate** with switch holes and mount points and electronics space
- `dist/bottom.scad` - 📦 **Bottom case** snap-fit bottom with screw sockets
- `dist/complete.scad` - 👀 **Preview** of assembled keyboard

> **🎯 Import into your slicer and print!** No supports needed, optimized for FDM printing.

## 🔩 **From Print to Perfect Keyboard**

### **Assembly is a Breeze** ⚡

1. **🖨️ Print** - Just drop the files into your slicer (no supports!)
2. **🔥 Heat Inserts** - Press M3 threaded inserts into corner mounts
3. **⌨️ Install** - Add your switches, wiring, and controller
4. **🔩 Assemble** - Four screws hold everything together perfectly
5. **🎉 Type** - Your custom keyboard is ready!

**Professional mounting system** with heat inserts means your keyboard will last for years of heavy typing.

## 🎯 Design Philosophy

** Parametric Design:**
- **Everything calculated** - No magic numbers or manual positioning
- **Single source of truth** - All dimensions flow from configuration
- **Mathematical precision** - Trigonometric layout calculations
- **Manufacturing ready** - Designed for FDM 3D printing constraints
- **Modular architecture** - Clean separation enables easy modification

## 🏗️ **Modular Architecture**

**flatboard** uses a clean, modular TypeScript architecture that makes customization and maintenance easy:

### **📁 Configuration Modules**
- **`interfaces.ts`** - All TypeScript types and interfaces for full type safety
- **`base-params.ts`** - Default configuration that all profiles inherit from  
- **`switches.ts`** - Switch specifications (Choc, MX) with precise measurements
- **`connector-specs.ts`** - Connector definitions (USB-C, TRRS) with geometry specs
- **`keyboard-profiles.ts`** - Pre-built keyboard profiles ready to use or customize
- **`config.ts`** - Main factory that orchestrates everything together

### **🎯 Advanced Row Layout System**
Our `rowLayout` system gives you **pixel-perfect control** over key placement:

```typescript
rowLayout: [
  { start: -1, length: 3, offset: 2 },  // Row can start anywhere on grid
  { start: 1, length: 4, offset: 0 },   // Each row independently positioned  
  { start: 0, length: 3, offset: 1 }    // Custom stagger per row
]
```

- **`start`**: Starting grid position (can be negative!)
- **`length`**: Number of keys in the row
- **`offset`**: Column stagger amount in mm

### **🔧 Type Safety**
Full TypeScript support with:
- **IntelliSense**: Autocomplete for all configuration options
- **Compile-time validation**: Catch errors before building
- **Interface documentation**: Self-documenting configuration structure

## 🔍 Advanced Features

### Generic Connector System
- **Multiple connector types** - USB-C (pill shape), TRRS (circle), extensible
- **Configurable placement** - Any face (top/bottom/left/right) with precise positioning
- **Smart positioning** - Automatic clearance from plate thickness and wall boundaries
- **Type-safe configuration** - Predefined connector specifications

### Mathematical Layout Engine
- **Rotation-aware calculations** - Handles arbitrary key rotations
- **Constraint-based positioning** - All coordinates calculated, not hardcoded
- **Split keyboard logic** - Automatic left/right mirroring with rotation inversion

## 🚀 **Join the Community!**

**Love what you've built?** We'd love to see it! 

- 📸 **Share your builds** - Post photos of your custom keyboards
- 💡 **Suggest features** - What connector types should we add next?
- 🐛 **Report issues** - Help us make flatboard even better
- 🔧 **Contribute code** - Add new switch types, connector shapes, or layouts

**This is more than just code** - it's a community of makers pushing the boundaries of custom keyboards. Your ideas and builds inspire everyone!

---

## 🎯 **Ready to Build Your Dream Keyboard?**

```bash
git clone git@github.com:20lives/flatboard.git
cd flatboard
bun install
bun run build
```

**That's it!** In 2 minutes you'll have professional 3D files for a custom split keyboard. No CAD experience required, just the power of JavaScript configuration.

**Start typing on YOUR perfect keyboard today!** 🚀⌨️✨

---

## 📝 License

MIT License - Build anything you want! 🎉
