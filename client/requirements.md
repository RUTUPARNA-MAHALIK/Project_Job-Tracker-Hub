## Packages
recharts | Beautiful and responsive charts for the analytics dashboard
date-fns | Formatting and parsing dates consistently
lucide-react | High-quality icons for the UI
react-hook-form | Form state management
@hookform/resolvers | Zod validation integration for forms

## Notes
Tailwind Config - Please ensure the following fonts are available in the theme (or standard CSS variables will be used):
--font-sans: 'DM Sans', sans-serif;
--font-display: 'Outfit', sans-serif;

Backend provides /api/auth/user and /api/login for authentication via Replit Auth.
The `use-auth.ts` hook is assumed to exist at `@/hooks/use-auth` and will be utilized for route protection.
