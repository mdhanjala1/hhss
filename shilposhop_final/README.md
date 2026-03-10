# ShilpoShop 🎨

Bengali art marketplace — connecting independent artists with customers.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Database + Auth)
- Cloudinary (Image hosting)
- Netlify (Hosting)

## Deploy to Netlify
1. Connect GitHub repo on Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables from `.env.example`

## Local Development
```bash
cp .env.example .env
# Fill in your Supabase and Cloudinary credentials
npm install
npm run dev
```

## New Features in v2
- 🛒 Shopping cart with quantity controls
- ❤️ Wishlist functionality
- 🔍 Sort by price/popularity
- 📦 Multi-item checkout
- 🎨 Professional artwork cards with Add to Cart
- 📱 Mobile-optimized cart & checkout
