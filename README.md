# React + Vite

## Notes API

The Notes feature runs at `/notes`. The local development API is an Express
server with its own SQLite database in `notes-api/`; the production API is a
Cloudflare Worker using D1. Neither uses the food-ordering database.

For local development, use Node.js 22.5 or newer. Install the API dependencies
once from `notes-api/`, set a private JWT secret, and start the local API:

```powershell
cd notes-api
npm install
$env:JWT_SECRET = "replace-this-with-a-random-secret-at-least-32-characters"
npm run dev
```

In a second terminal at the repository root, run `npm run dev`. Open the
displayed local URL and select **Notes**. Local API requests default to
`http://localhost:3000`; use a root `.env.local` file with `VITE_API_URL` to
override it. The local API allows `http://localhost:5173` by default.

To verify the local setup:

1. Open `http://localhost:3000/api/notes`. A JSON array (for example, `[]`)
   confirms the API is responding.
2. Open the Vite URL and go to `/notes`.
3. Register an account, log in, and add a note. Confirm it appears in **My
   Notes**, then try editing and deleting it.
4. If the page cannot connect, make sure both terminals are still running and
   that the frontend is using the API URL shown above.

## Admin account

Open `/admin/login` after starting both servers. If no admin exists, this page
offers registration for the first admin account (password must be at least 8
characters). Once created, the page switches to login; admin registration is no
longer public. The old local demo credentials are not used by API-backed admin
login.

## Free GitHub-based deployment

GitHub Actions deploys the React frontend to GitHub Pages and the Notes API to
Cloudflare Workers. Cloudflare D1 stores online notes and accounts persistently.
The free plans have provider usage limits; no paid plan is required for this
setup. Create a free Cloudflare account and complete this one-time setup:

1. In Cloudflare, create a D1 database named `food-ordering-notes`. Copy its
   database ID and your Cloudflare account ID.
2. Create a Cloudflare API token scoped to this account with **Workers Scripts:
   Edit** and **D1: Edit** permissions.
3. In this GitHub repository, open **Settings → Secrets and variables →
   Actions**. Add repository variables `CLOUDFLARE_ACCOUNT_ID` and
   `CLOUDFLARE_D1_DATABASE_ID`. Add repository secrets `CLOUDFLARE_API_TOKEN`
   and `JWT_SECRET` (use a random secret of at least 32 characters; do not
   commit it).
4. In **Settings → Pages**, set the build/deployment source to **GitHub Actions**.
   Run the **Deploy Notes API to Cloudflare** workflow from the **Actions** tab.
   It applies the D1 schema and publishes the Worker. Find the Worker URL in
   that workflow's output or Cloudflare's Workers dashboard.
5. Add the repository Actions variable `VITE_API_URL` with the Worker URL, such
   as `https://food-ordering-notes-api.<your-subdomain>.workers.dev` (no trailing
   slash). Re-run **Deploy to GitHub Pages**, or push a new commit to `main`.

After setup, pushes to `main` publish the frontend and redeploy the API when
`notes-api/` changes. The pages workflow deliberately fails if `VITE_API_URL` is
missing, instead of publishing a site whose API forms point at localhost. The
API allows the GitHub Pages origin and local Vite origin by default. Online
admin/user accounts and notes are stored in D1, not in the local SQLite file.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
