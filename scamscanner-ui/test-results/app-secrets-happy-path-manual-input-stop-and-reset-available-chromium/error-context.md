# Page snapshot

```yaml
- navigation:
  - link "ScamScanner":
    - /url: /
  - link "Home":
    - /url: /
  - link "Scanner":
    - /url: /scanner
  - link "Secrets":
    - /url: /secrets
  - link "Auditor":
    - /url: /auditor
  - link "History":
    - /url: /history
  - link "Mission":
    - /url: /mission
  - link "Settings":
    - /url: /settings
  - link "Support":
    - /url: /support
  - button "Toggle theme"
- main:
  - text: Secrets Scanner Analyze a webpage or pasted code to find exposed secrets like API keys and credentials. Website URL
  - textbox "Website URL"
  - button "Scan for Secrets" [disabled]
  - button "Paste code manually"
  - text: Error
  - paragraph: A WebSocket connection error occurred.
- contentinfo:
  - paragraph: Powered by Google Gemini and a single over-caffeinated, under-rested developer.
  - paragraph: © 2025 ScamScanner by Level 3 Labs. For educational purposes only.
- alert
```