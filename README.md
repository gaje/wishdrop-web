# Wishlists Web App

Next.js web application for the Wishlists platform, allowing users to create and share wishlists via the web.

## Features

### Implemented
- **Home Page (/)**: Discover page showing trending, new, and featured lists
- **Public List View (/u/[username]/[slug])**: View any public wishlist with items
- **Create List Page (/create)**: Placeholder for creating new lists (requires authentication)
- **Responsive Design**: Works on desktop, tablet, and mobile browsers
- **Shared API Client**: Uses the same backend API as the mobile app
- **Gradient UI**: Matches the mobile app's beautiful cyan-purple-pink gradient theme

### Pages
- `/` - Home/Discover page
- `/u/[username]/[slug]` - Public list view
- `/create` - Create new list (auth required)
- `/login` - Login (TBD)
- `/signup` - Sign up (TBD)

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: JavaScript (ES6+)
- **API**: Shared backend at http://10.0.0.25:4000

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running at http://10.0.0.25:4000

### Installation
```bash
cd wishlist-web
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## Project Structure
```
wishlist-web/
├── app/                    # Next.js app directory
│   ├── create/            # Create list page
│   ├── u/[username]/[slug]/ # Public list view
│   ├── layout.js          # Root layout
│   ├── page.js            # Home/discover page
│   └── globals.css        # Global styles
├── lib/                   # Shared utilities
│   └── api.js            # API client
├── components/            # React components (TBD)
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_API_BASE=http://10.0.0.25:4000
```

## Next Steps
- [ ] Implement authentication (login/signup pages)
- [ ] Add user dashboard for managing lists
- [ ] Implement create/edit list functionality
- [ ] Add social features (likes, comments)
- [ ] Implement PWA capabilities
- [ ] Add SEO optimization
- [ ] Create browser extension

## Notes
- The web app shares the same backend API with the mobile app
- Uses localStorage for auth token storage (vs SecureStore on mobile)
- Designed to be accessible for non-mobile users (grandparents, etc.)
