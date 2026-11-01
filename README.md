# E-Commerce Storefront (Frontend)

This is the customer-facing storefront and internal admin panel for the e-commerce platform. It is a single-page application (SPA) built with React and Vite.

## Architecture Context

This project is the frontend of a decoupled, serverless architecture:
- **Frontend (This Repo)**: Hosted on cPanel. Handles UI, routing, and client-side state.
- **Database & Backend (Supabase)**: Handles user authentication, order storage, file uploads (receipts), and Edge Functions for email notifications.
- **Email (Resend)**: Handles transactional emails (auth confirmations and order notifications).
- **CMS (Sanity)**: Manages all public-facing content (products, categories, shipping rates, payment details).

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: Zustand (cart, checkout, auth, orders)
- **Backend / Auth / DB**: Supabase
- **CMS Integration**: Sanity Client (read-only)

## Local Development

### Prerequisites
- Node.js 20+
- A `.env` file with the required credentials (see below).

### Setup

1. Install dependencies:
   npm install

2. Environment Variables:
   Create a `.env` file in the root directory. You will need the following:
   
   VITE_SANITY_PROJECT_ID=your_sanity_project_id
   VITE_SANITY_DATASET=production
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key

3. Run the development server:
   npm run dev
   
   The app will be available at http://localhost:5173.

## Building for Production

To create a production-ready build, run:
npm run build

This generates a `dist/` folder containing the static HTML, CSS, and JS files. 

Because this is a Single Page Application (SPA), the hosting server requires an `.htaccess` file to handle client-side routing. Ensure the server has the following configuration:
apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>


## Deployment (cPanel)

This project is deployed to a standard cPanel environment using static file hosting.

1. Run `npm run build` locally.
2. Zip the contents of the `dist/` folder.
3. Log in to cPanel File Manager and navigate to `public_html`.
4. Upload the zip file and extract it. Ensure `index.html` is at the root of `public_html`.
5. Verify the `.htaccess` file contains the SPA rewrite rules shown above.

## Admin Panel

The site includes a built-in admin panel for managing orders and receipts.
- URL: `/admin`
- Protected by Supabase Auth (Role-Based Access Control). Only users with the `admin` role in the `profiles` table can access this route.