# Gradient Background Generator

A powerful Next.js application for creating stunning SVG gradient backgrounds with real-time preview and an innovative color wheel interface featuring dual-mode color selection.

## Features

- **Real-time Preview**: See your gradient backgrounds update instantly as you modify colors
- **Interactive Color Wheel**: Visual color selection with an intuitive circular interface
- **Dual Selection Modes**:
  - **Free Select Mode**: Manually choose two colors independently on the color wheel
  - **Recommend Mode**: Select a primary color and get AI-powered harmony suggestions
- **Color Harmony Algorithms**: Based on established color theory principles:
  - Complementary (互补色)
  - Analogous (类似色)
  - Triadic (三角色)
  - Split-Complementary (分裂互补)
  - Tetradic (四角色)
  - Monochromatic (单色)
- **Custom Color Palettes**: Add up to 8 colors to create unique gradients
- **Preset Templates**: Choose from professionally designed color combinations
- **API Integration**: Generate gradients programmatically via REST API
- **SVG Export**: Download your creations as high-quality SVG files
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Color Selection Modes

### Free Select Mode (自由选择模式)
In this mode, you can independently select two colors on the color wheel:
- Drag the "主" (Primary) dot to set the main color
- Drag the "次" (Secondary) dot to set the secondary color
- Adjust brightness with the slider below the wheel
- Perfect for creating custom color combinations

### Recommend Mode (推荐选择模式)
In this mode, the system helps you find harmonious color combinations:
1. Select your primary color on the wheel
2. The system automatically suggests a complementary secondary color
3. Browse through 6 different harmony rule suggestions:
   - **Complementary**: Colors opposite each other on the color wheel
   - **Analogous**: Colors adjacent to each other
   - **Triadic**: Three colors evenly spaced on the wheel
   - **Split-Complementary**: Base color plus two adjacent to its complement
   - **Tetradic**: Four colors forming a rectangle on the wheel
   - **Monochromatic**: Variations of a single hue

## Color Theory Algorithm

The color recommendation system uses the HSL (Hue, Saturation, Lightness) color model and established color theory principles:

```
Complementary:    Hue + 180°
Analogous:        Hue ± 30°
Triadic:          Hue + 120°, + 240°
Split-Comp:       Hue + 150°, + 210°
Tetradic:         Hue + 90°, + 180°, + 270°
Monochromatic:    Same hue, varying saturation/lightness
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
```

## Testing

Run the color utility tests to verify the color theory algorithms:

```bash
# Using ts-node (recommended)
npx ts-node test-color-utils.ts

# Or with Jest (if installed)
npm test
```

The test suite covers:
- Color format conversions (HEX ↔ RGB ↔ HSL)
- Color distance calculations
- Harmony color generation for all 6 harmony types
- Color wheel position calculations
- Random color generation

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
```

## Custom Domain

The deployed application is available at:

**gbg.nuclearrockstone.xyz**

Configure your DNS and Cloudflare settings accordingly (add the appropriate CNAME/A records and route the domain to your Cloudflare deployment).

## API Usage

Generate gradients programmatically using the REST API:

```
GET https://gbg.nuclearrockstone.xyz/api?colors=hex_FF0000&colors=hex_00FF00&width=800&height=600
```

### Parameters:
- `colors`: Hex colors with `hex_` prefix (e.g., `hex_FF0000` for red)
- `width`: Image width in pixels (100-2000)
- `height`: Image height in pixels (100-2000)

### Example with curl:
```bash
curl "https://gbg.nuclearrockstone.xyz/api?colors=hex_5135FF&colors=hex_FF5828&width=1200&height=800" \
  --output gradient.svg
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── route.ts          # API endpoint for SVG generation
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main application page
├── components/
│   ├── ui/                   # UI components (button, card, input)
│   ├── ColorDot.tsx          # Color selection dot component
│   ├── ColorWheel.tsx        # Interactive color wheel
│   └── HarmonySuggestions.tsx # Color harmony suggestions panel
├── hooks/
│   └── useGradientGenerator.tsx # Gradient generation hook
├── lib/
│   ├── services/
│   │   └── gradientGenerator.ts # SVG generation logic
│   ├── colorUtils.ts         # Color theory algorithms
│   ├── constants.ts          # Color presets
│   └── utils.ts              # Utility functions
└── ...
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **HSL Color Model** - Color calculations

## Color Harmony Mathematics

The color wheel is based on the HSL color space where:
- **Hue** (0-360°): Position on the color wheel
- **Saturation** (0-100%): Distance from center
- **Lightness** (0-100%): Brightness adjustment

Color positions on the wheel are calculated using polar coordinates:
```
x = cos(hue) * saturation
y = sin(hue) * saturation
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Color Theory - Adobe](https://color.adobe.com/create/color-wheel)
- [HSL Color Model](https://en.wikipedia.org/wiki/HSL_and_HSV)

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Next.js and modern web technologies.
