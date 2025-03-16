# Casa Coração Website

A spiritual wellness center website built with Astro.js and Directus CMS.

## 🌟 Features

- 🚀 Built with Astro.js for fast performance
- 📱 Responsive design with Tailwind CSS
- 🗃️ Headless CMS integration with Directus
- 🌍 Multi-language support (PT/EN)
- 📝 Blog system with articles and events
- 🎥 Video integration with Rumble
- 📊 SEO optimized

## 🛠️ Tech Stack

- [Astro.js](https://astro.build) - Web framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Directus](https://directus.io) - Headless CMS
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Directus instance running

### Environment Setup

Create a `.env` file in the root directory:

```env
PUBLIC_DIRECTUS_URL=your_directus_url
PUBLIC_DIRECTUS_TOKEN=your_directus_token
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── layouts/     # Page layouts
│   ├── pages/       # Route pages
│   └── utils/       # Utility functions
└── package.json
```

## 🔧 Configuration

The site can be configured by modifying:

- `astro.config.mjs` - Astro configuration
- `tailwind.config.cjs` - Tailwind CSS configuration
- `src/utils/utils.ts` - Utility functions and API settings

## 📝 Content Management

Content is managed through Directus CMS. Main collections:

- Events
- Blog Posts
- Testimonials
- Services
- Pages

## 🚀 Deployment

The site is built as a static site and can be deployed to any static hosting platform.

## 📫 Contact

For questions and support, please contact [project maintainer](https://github.com/jmciso).