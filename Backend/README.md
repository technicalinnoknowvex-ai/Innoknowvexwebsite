# INNOKNOWVEX Backend

## Setup

1. Copy `.env.example` to `.env`.
2. Put the Supabase URL and anon key in `.env`.
3. Run `supabase/auth_new.sql` in the Supabase SQL Editor.
4. Start the backend with `npm run dev`.

## Authentication routes

- `POST /api/auth/register` with `{ "fullName", "email", "password", "confirmPassword" }`
- `POST /api/auth/login` with `{ "email", "password" }`
- `POST /api/auth/logout` with `Authorization: Bearer <access_token>`
- `GET /api/auth/me` with `Authorization: Bearer <access_token>`
- `POST /api/auth/forgot-password` with `{ "email", "redirectTo"? }`
- `POST /api/auth/reset-password` with `{ "password" }` and `Authorization: Bearer <access_token>`

## Roles

Protected routes use `authenticate`. Admin-only routes must use both middleware functions:

```js
router.get("/admin-example", authenticate, adminOnly, controller.adminExample);
```

The accepted roles are `admin` and `student`/`user`. Roles are read from Supabase `app_metadata.role`, which must be assigned server-side; public clients cannot grant themselves admin access through `user_metadata`.

The reset-password request uses the access token Supabase provides after the recovery link is opened. Supabase's managed `auth.users` table cannot be renamed; the application-owned profile table is named `user_profiles_new`.

The `user_profiles_new` table stores `id`, `full_name`, `email`, `created_at`, and `updated_at`. The signup trigger copies `full_name` from user metadata and `email` from `auth.users`.

## Program APIs

Run `supabase/programs_new.sql` in Supabase SQL Editor before using these routes.

Public routes:

- `GET /api/programs`
- `GET /api/programs/:slug`
- `GET /api/categories`

Admin routes require `Authorization: Bearer <admin_access_token>` where the token user has `app_metadata.role = "admin"`:

- `POST /api/admin/programs`
- `GET /api/admin/programs`
- `GET /api/admin/programs/:id`
- `PUT /api/admin/programs/:id`
- `DELETE /api/admin/programs/:id`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

Program create/update body fields use camelCase:

```json
{
	"title": "Full-Stack Web Development",
	"slug": "web-development",
	"category": "Web Development",
	"shortDescription": "Build production-ready web applications.",
	"description": "A complete full-stack development program.",
	"tag": "Popular Program",
	"heroImage": "/images/programs/web-development.jpg",
	"status": "published",
	"featured": true,
	"popular": true,
	"duration": "6 Months",
	"hours": 100,
	"projectCount": 10,
	"certificate": true,
	"internship": true,
	"placementSupport": true,
	"originalPrice": 6000,
	"price": 2500,
	"discount": 58
}
```