# Medipath.AI Landing Page

Static, GitHub Pages-ready marketing and early-access launch page for Medipath.AI.

## Files

- `index.html` - page content and layout
- `styles.css` - responsive visual design
- `script.js` - bilingual page copy and waitlist form handling
- `config.js` - public waitlist configuration
- `supabase-waitlist.sql` - waitlist table and RLS policy reference
- `assets/` - Medipath logo and icon assets

## Waitlist storage

The launch form is designed to submit to Supabase table `public.waitlist_signups`.
The table stores:

- `id`
- `name`
- `email`
- `specialty`
- `city_state`
- `clinic_hospital`
- `whatsapp`
- `consent`
- `created_at`
- `status`

Allowed status values:

- `New`
- `Contacted`
- `Invited`
- `Pilot User`
- `Converted`

RLS is enabled. Anonymous visitors may insert new waitlist requests but cannot
read or export existing submissions.

To activate direct database submissions from the public page, set the Supabase
publishable key in `config.js`. The publishable/anon key is safe to expose only
with the RLS policy above; never use a service-role key in this static site.

If the publishable key is blank, the form opens a prepared email fallback.

## View and export submissions

View submissions in Supabase Dashboard:

1. Open the Supabase project.
2. Go to Table Editor.
3. Open `waitlist_signups`.

Export options:

- Supabase Table Editor CSV export.
- SQL query export from the dashboard.
- Later, connect the table to a CRM or admin dashboard.

## Preview locally

Open `index.html` directly in a browser, or run a local static server from this folder.

## Deploy to GitHub Pages

1. Create a repository, for example `medipath-landing`.
2. Add these files to the repository root.
3. Push to GitHub.
4. In GitHub, go to Settings -> Pages.
5. Set Source to `Deploy from a branch`.
6. Select branch `main` and folder `/root`.
7. Save.

Later, a custom domain can be configured in the same Pages settings.
