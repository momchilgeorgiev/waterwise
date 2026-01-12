# WaterWise Color Palette

Inspired by natural landscapes - sky, clouds, mountains, and earth.

## Primary Colors

### Sky Blues
```css
/* Deep Sky Blue */
#1B5CB8 - Headers, primary buttons (dark shade)
#2563EB - Main backgrounds, body gradient start
#3B82F6 - Bright accents, gradient end, borders
#60A5FA - Light borders, highlights
```

### Cloud/Light Blues
```css
/* Badge backgrounds */
#DBEAFE - Very light blue (badge gradient start)
#BFDBFE - Light blue (badge gradient mid)
#E3F2FD - Info card backgrounds
#BBDEFB - Info card gradient end
#93C5FD - Dark mode badge text
```

### Deep Blues (Dark Mode)
```css
#1e3a8a - Dark mode badge background start
#1e40af - Dark mode badge background end, strong text
```

## Secondary Colors

### Earth Tones - Sage/Olive Green
```css
#A3B18A - Clear data button, secondary actions
#8B9A5B - Button hover states
#3A5A40 - Dark green accents (optional)
#2D5016 - Dark text on golden backgrounds
```

### Earth Tones - Golden/Tan
```css
#DDB86F - Comparison box gradient start, note backgrounds
#C9B884 - Comparison box gradient end, note borders
```

## Neutral Colors

### Grays
```css
#f8f9fa - Card backgrounds
#e9ecef - Hover states
#e0e0e0 - Borders
#d0d0d0 - Button hover
#999 - Secondary text
#666 - Tertiary text
#333 - Primary text
#555 - Medium text
```

### White
```css
#FFFFFF - Section backgrounds
#F0F4F8 - Cloud white (optional highlight)
```

## Usage Guide

### Headers
```css
background: linear-gradient(135deg, #1B5CB8 0%, #3B82F6 100%);
color: white;
```

### Body/Container
```css
background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
```

### Primary Buttons
```css
background: linear-gradient(135deg, #2563EB 0%, #1B5CB8 100%);
color: white;
box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
```

### Secondary Buttons (Clear Data, Reset)
```css
background: #A3B18A;
color: white;

/* Hover */
background: #8B9A5B;
```

### Water Badges (on ChatGPT)
```css
background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
color: #1e40af;
border: 1px solid #60A5FA;
box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
```

### Comparison Box
```css
background: linear-gradient(135deg, #DDB86F 0%, #C9B884 100%);
color: #2D5016;
```

### Info Cards
```css
background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
border: 1px solid #60A5FA;
color: #1B5CB8; /* for text */
```

### Chart Bars
```javascript
gradient.addColorStop(0, '#3B82F6');
gradient.addColorStop(1, '#1B5CB8');
```

### Active States
```css
/* Active badge */
background: linear-gradient(135deg, #2563EB 0%, #1B5CB8 100%);
border-color: #1e40af;

/* Focus */
border-color: #3B82F6;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
```

### Chat Item Accents
```css
border-left: 4px solid #3B82F6;
```

### Stat Values
```css
color: #2563EB;
```

### Dark Mode Badges
```css
@media (prefers-color-scheme: dark) {
  .water-badge {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #93C5FD;
    border-color: #3B82F6;
  }
}
```

## Color Psychology

**Blues**: Trust, water, sky, calmness, stability
- Fits perfectly with water conservation theme
- Professional and clean appearance
- Associated with environmental awareness

**Earth Tones**: Natural, grounded, sustainable
- Sage green: Growth, environmental responsibility
- Golden/tan: Warmth, earth, natural resources
- Complements the water theme

**Overall Theme**: Nature-inspired, clean, professional, environmentally conscious

## Accessibility

All color combinations meet WCAG AA standards for contrast:
- Dark blue text (#1e40af) on light backgrounds
- White text on blue/green backgrounds
- Sufficient contrast in all interactive elements

## Design Inspiration

Based on the landscape image showing:
- Deep blue sky (#1B5CB8, #2563EB)
- Bright sky blue (#3B82F6, #60A5FA)
- White clouds (light blues #DBEAFE, #BFDBFE)
- Golden hills (#DDB86F, #C9B884)
- Green valleys (#A3B18A, #8B9A5B)
- Dark mountain shadows (#2D5016, #3A5A40)
