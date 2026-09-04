# Customization Guide — Pro Pack

Rebrand the template for your client. Use the included AI Chatbot Prompt Kit to generate business content.

## Rebrand Steps

### 1. App Identity

Edit `public/manifest.json`:

```json
{
  "name": "Client App Name",
  "short_name": "ClientApp",
  "description": "What this PWA does for the client"
}
```

### 2. Favicon & Icons

Replace these files with client branding:

- `public/favicon.png` (512x512 recommended)
- `public/icons/icon-192.png` (192x192, required)
- `public/icons/icon-512.png` (512x512, required)

### 3. Color Scheme

Edit `src/style.css` custom properties:

```css
:root {
  --bg: #YOUR_BG;
  --card-bg: #YOUR_CARD_BG;
  --text: #YOUR_TEXT;
  --accent: #YOUR_ACCENT;
  --border: #YOUR_BORDER;
}
```

### 4. Title & Tagline

In `src/main.js`, find the `homeView()` function and update:

```js
<h1>Your Client's App Name</h1>
<p>Your custom tagline here</p>
```

### 5. Footer Text

Same file, update the footer in `homeView()` and `toolView()`:

```js
<footer><p>Your client's footer text</p></footer>
```

## Using the AI Chatbot Prompt Kit

The `AI-CHATBOT-PROMPT-KIT/` folder contains ready-to-use system prompts for different business types:

| File | Use Case |
|------|----------|
| `BOOKING.md` | Appointment scheduling |
| `CONSULTING.md` | Professional consulting |
| `ECOMMERCE.md` | Online store support |
| `HEALTHCARE.md` | Medical/practice info |
| `SERVICES.md` | General service businesses |
| `DISCLAIMER.md` | Legal disclaimer for AI chatbot |

### How to Use

1. Open the prompt file for your client's industry
2. Copy the entire system prompt
3. Paste it into any LLM (ChatGPT, Claude, Gemini, etc.)
4. Replace `[PLACEHOLDER]` values with client-specific info
5. Test the chatbot responses
6. Fine-tune tone and accuracy as needed

### Customizing Placeholders

Each prompt has `[PLACEHOLDERS]` in brackets. Examples:

- `[BUSINESS NAME]` → Client's actual business name
- `[PHONE NUMBER]` → Their contact number
- `[SERVICES OFFERED]` → Their specific services
- `[HOURS OF OPERATION]` → When they're open

Replace all placeholders before using the prompt in production.
