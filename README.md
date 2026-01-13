# 💧 WaterWise - ChatGPT Water Usage Tracker

![Version](https://img.shields.io/badge/version-2.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome-yellow)

**WaterWise** is a Chrome extension that estimates and visualizes the water consumption of your ChatGPT conversations based on 2024-2025 research studies.

Raise awareness about the environmental impact of AI usage while tracking your ChatGPT water footprint in real-time.

---

## Features

### Real-Time Water Usage Badges
- **Automatic tracking**: Water consumption badges appear below every ChatGPT response
- **Accurate estimates**: Based on research-backed calculations (default: 15ml per 100 words)
- **Beautiful design**: Gradient backgrounds with animated water drop icons
- **Dark mode support**: Adapts to your ChatGPT theme

### Interactive Statistics Dashboard
- **Total water consumption**: Track cumulative usage across all conversations
- **Visual charts**: See which conversations consume the most water
- **Real-world comparisons**: "That's about 2 water bottles!"
- **Conversation history**: Browse recent chats with water metrics
- **Quick stats**: Active chats and total message counts at a glance

### Customizable Settings
- **Preset options**: Conservative (25ml/100 words), Balanced (15ml/100 words), or Optimistic (8ml/100 words)
- **Custom values**: Set your own ml/word estimate (0.01-1.0)
- **Research-backed**: Detailed information about water usage calculations
- **Real-time updates**: Changes apply immediately without page reload

### Floating Button (Optional)
- **Quick access**: Click the floating button on ChatGPT to open the dashboard
- **Non-intrusive**: Positioned in the bottom-right corner
- **Toggle on/off**: Enable or disable in settings

---

## Installation

### From Source

1. Clone or download this repository:
   ```bash
   git clone https://github.com/yourusername/waterwise.git
   cd waterwise
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked**

5. Select the `waterwise` folder

6. The extension icon should appear in your Chrome toolbar

### From Chrome Web Store

*Coming soon - extension pending publication*

---

## Usage

### Getting Started

1. **Install the extension** following the instructions above

2. **Visit ChatGPT** at [chatgpt.com](https://chatgpt.com)

3. **Start a conversation** and watch water badges appear below AI responses

4. **Click the extension icon** in the toolbar to view your dashboard

5. **Open settings** (⚙️ button) to customize water estimates

### Opening the Dashboard

**Option 1**: Click the WaterWise extension icon in Chrome toolbar

**Option 2**: Click the floating button in the bottom-right corner of ChatGPT (if enabled)

### Customizing Settings

1. Click the **⚙️ Settings** button in the dashboard
2. Choose a preset or enter a custom value
3. Click **Save Settings**
4. New calculations use your updated estimate immediately

### Clearing Data

1. Open the dashboard
2. Click **Clear Data** at the bottom
3. Confirm the action
4. All tracked data will be reset

---

## How It Works

### Water Calculation Formula

```
words = AI_response.split(/\s+/).length
milliliters = words × mlPerWord
liters = milliliters / 1000
```

**Default**: `mlPerWord = 0.15` (15ml per 100 words)

### Research Basis

Water consumption estimates are based on published research from:

- **University of California, Riverside (2023)**: "Making AI Less Thirsty" study
- **OpenAI Infrastructure Reports (2024)**: GPT-4 operational costs
- **Data Center Efficiency Studies (2024-2025)**: PUE and WUE metrics
- **Google & Microsoft Sustainability Reports**: Cloud AI water consumption

### Why Estimates Vary

Water usage depends on multiple factors:
- **Data center location**: Hot climates require more cooling
- **Cooling technology**: Modern systems are 10-25x more efficient
- **Model size**: Larger models consume more resources
- **Season**: Summer cooling vs winter efficiency
- **Infrastructure age**: Newer centers use less water

Our default (15ml/100 words) represents a **conservative mid-range estimate** for modern data centers.

---

## Privacy & Data

### What's Stored Locally
- Per-chat water usage totals
- Message counts per conversation
- Last updated timestamps
- Chat URLs for navigation
- Your custom ml/word setting

### What's NOT Collected
- ❌ Message content or conversations
- ❌ User identity or personal information
- ❌ Analytics or telemetry data
- ❌ No external server communication

**All data stays on your computer** via Chrome's local storage.

---

## Project Structure

```
waterwise/
├── manifest.json           # Extension configuration
├── background.js          # Service worker for popup windows
├── content.js             # Injects water badges into ChatGPT
├── popup.html             # Dashboard UI
├── popup.css              # Dashboard styles
├── popup.js               # Dashboard logic
├── settings.html          # Settings page UI
├── settings.css           # Settings page styles
├── settings.js            # Settings page logic
├── styles.css             # Content script styles (badges)
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── FEATURES.md            # Detailed features documentation
├── COLOR_PALETTE.md       # Design system colors
└── README.md              # This file
```

---

## Development

### Prerequisites
- Chrome browser (version 88+)
- Basic knowledge of HTML, CSS, JavaScript
- Text editor or IDE

### Making Changes

1. Edit the source files as needed
2. Save your changes
3. Go to `chrome://extensions/`
4. Click the **Reload** button on the WaterWise extension
5. Test your changes on ChatGPT

### Key Files to Modify

| File | Purpose |
|------|---------|
| `content.js` | Badge injection and calculation logic |
| `popup.js` | Dashboard data display and charts |
| `settings.js` | Settings page functionality |
| `*.css` | Visual styling and design |
| `manifest.json` | Extension metadata and permissions |

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full Support | Primary target (Manifest V3) |
| Edge | ✅ Full Support | Chromium-based |
| Brave | ✅ Full Support | Chromium-based |
| Firefox | ⚠️ Not Tested | May require manifest modifications |
| Safari | ❌ Not Supported | Different extension format required |

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Ideas for Contributions
- Export data as CSV/JSON
- Weekly/monthly usage reports
- Historical charts and trends
- Integration with other AI platforms
- Translations and internationalization
- Additional research data sources

---

## Known Issues

- Settings window may appear narrow when opened from bookmark bar *(Fixed in v2.0.2)*
- Real-time sync delay of up to 2 seconds between tabs
- Chart limited to top 5 conversations

---

## Roadmap

### v2.1.0 (Planned)
- [ ] Export data functionality (CSV/JSON)
- [ ] Weekly usage summary notifications
- [ ] Historical trend charts

### v2.2.0 (Future)
- [ ] Carbon footprint estimates
- [ ] Badge customization options
- [ ] Multi-language support

### v3.0.0 (Ideas)
- [ ] Support for Claude, Gemini, and other AI platforms
- [ ] Anonymous usage comparisons
- [ ] Browser sync across devices

---

## FAQ

**Q: Is this extension official?**
A: No, WaterWise is an independent project created to raise awareness about AI's environmental impact.

**Q: Are the water estimates accurate?**
A: They are research-based estimates. Actual consumption varies by provider, location, and model. We aim for awareness, not precision.

**Q: Does this slow down ChatGPT?**
A: No, the extension runs asynchronously and has minimal performance impact.

**Q: Can I disable the floating button?**
A: Yes, go to Settings and uncheck "Show floating button on ChatGPT".

**Q: Where is my data stored?**
A: All data is stored locally in Chrome's storage on your computer. Nothing is sent to external servers.

**Q: Can I use this on mobile?**
A: Not currently. Chrome extensions only work on desktop browsers.

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## Acknowledgments

- Research from University of California, Riverside
- OpenAI infrastructure reports
- Data center efficiency studies
- The open-source community

---

## Support

Found a bug or have a feature request?

- **Issues**: [Open an issue](https://github.com/yourusername/waterwise/issues)
- **Discussions**: [Start a discussion](https://github.com/yourusername/waterwise/discussions)
- **Email**: your.email@example.com

---

**Made with 💧 for sustainability awareness**

*Every query counts. Be mindful of your AI water footprint.*
