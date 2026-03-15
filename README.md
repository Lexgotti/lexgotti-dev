# Lexgotti.dev V2

This is the **V2 starter pack** for the Lexgotti.dev builder portal.

## Included
- `index.html`
- `styles.css`
- `script.js`
- `api/build.js`
- `.env.example`
- `package.json`

## What changed from V1
- Added real front-end API call support
- Added project type selector
- Added fallback mode if API is not active
- Added serverless API example for AI blueprint generation

## Important truth
If you upload only with **FTP/static hosting**, the front end will load, but the file:
- `api/build.js`

will **not run** on plain static hosting.

That route needs a platform that supports:
- Node.js
- serverless functions
- or a custom backend

Examples:
- Vercel
- Netlify Functions
- a VPS running Node
- your own backend server

## If you still use FTP only
You can still upload:
- `index.html`
- `styles.css`
- `script.js`

The site will work in **fallback demo mode** and still generate a front-end blueprint preview.

## To use the real AI route
1. Put this project on a Node/serverless host
2. Add your environment variable:
   - `OPENAI_API_KEY`
3. Deploy
4. Test the builder

## Next stage after this
- login/auth
- project save system
- user dashboard
- export generated files
- admin/private Lexi control center
