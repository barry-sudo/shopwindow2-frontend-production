# Shop Window Frontend
Retail CRE Intelligence Platform - React + TypeScript

## Quick Start
```bash
npm install
npm run dev
```

## Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_API_URL=http://localhost:8000
```

## Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

## Features
- Interactive property maps with Google Maps
- Two-mode system (Verified/Scenario data)
- Property search and filtering
- Responsive desktop-first design
- Mock API ready for backend integration

## Tech Stack
- React 18 + TypeScript
- Vite build system
- React Router DOM
- Google Maps integration
- CSS custom properties

## Deployment
Built for GitHub → Render → Bluehost architecture.

## Architecture
```
src/
├── components/    # React components
├── pages/         # Route components  
├── services/      # API integration
├── styles/        # Design system CSS
├── types/         # TypeScript interfaces
└── contexts/      # React contexts
```