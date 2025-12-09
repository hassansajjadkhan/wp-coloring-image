# Coloring Automation Client

Frontend dashboard for AI Coloring Page Automation System

## Features

- 📝 Create prompts with custom parameters
- 💡 AI-powered idea generation
- 👁️ Visual review & approval gallery
- ✏️ SEO metadata editor (auto-filled)
- ⏰ Scheduler configuration
- 📊 Real-time generation progress

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm run preview
```

## Configuration

The frontend connects to the backend API at:
- Development: `http://localhost:3001/api`
- Production: `https://your-api.vercel.app/api`

## File Structure

```
src/
├── App.tsx              # Main app with routing
├── App.css              # Global styles
├── index.css            # Base styles
├── index.tsx            # Entry point
└── components/
    ├── PromptForm.tsx         # Step 1: Create prompt
    ├── IdeasGenerator.tsx      # Step 2: Generate ideas
    ├── ReviewGallery.tsx       # Step 3: Review pages
    ├── SEOEditor.tsx           # SEO metadata editing
    └── SchedulerSettings.tsx   # Step 4: Configure scheduler
```

## Component Overview

### PromptForm
- Theme input
- Quantity selector
- Style selection
- Category input

### IdeasGenerator
- Displays generated ideas
- Selection checkboxes
- Regenerate button
- Start generation button

### ReviewGallery
- Image preview grid
- Approve/reject buttons
- SEO editor modal
- Approved pages list

### SEOEditor
- Page title (30 chars)
- SEO title (60 chars)
- Meta description (160 chars)
- Alt text (125 chars)
- Category selector

### SchedulerSettings
- Daily post limit
- Publish hour/minute
- Status display

## Styling

Uses custom CSS with:
- Gradient backgrounds
- Card-based layout
- Responsive grid system
- Dark mode ready

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
