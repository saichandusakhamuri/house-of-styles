# House of Styles

A premium clothing website prototype built as a static frontend that runs without a build step.

## Included

- Premium shopping layout with search, filters, and curated products
- VIP club membership section
- Custom tailoring request form for made-to-measure clothing
- Cart drawer with local persistence using `localStorage`
- Simple admin-style counters for VIP leads, custom orders, and cart value

## Run

Open [index.html](./index.html) in a browser.

## Shareable link with Vercel

This project is ready to deploy as a static site on Vercel.

1. Go to [Vercel](https://vercel.com).
2. Create a new project.
3. Upload this folder: `C:\Users\saich\OneDrive\Documents\New project`
4. Keep the default static deployment settings.
5. Click `Deploy`.

Vercel will generate a public shareable link for the website.

Clean URLs are enabled, so routes like `/vip` and `/custom` will work without typing `.html`.

## Next production steps

1. Connect Firebase Authentication for real accounts.
2. Store VIP leads, orders, and custom requests in Firestore.
3. Add image uploads with Firebase Storage.
4. Integrate Razorpay or Stripe for live checkout.
5. Add an admin dashboard with protected access and order status tracking.
