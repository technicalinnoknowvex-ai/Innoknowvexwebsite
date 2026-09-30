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
Run `supabase/program_pricing_new.sql` as well to create and seed the pricing table from the supplied CSV. Rows where all six prices are `0.00` were intentionally excluded.
Run `supabase/storage_new.sql` to create the public media buckets and admin-only upload policies.

Admin media uploads use `multipart/form-data`, with a maximum file size of 10 MB. Program uploads use `image` for an image and `brochure` for a PDF. Testimonial uploads use `profileImage`, and partner uploads use `logo`. The resulting public Storage URLs are saved in the related table.

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
	"imageUrl": "",
	"brochureUrl": "",
	"status": "published",
	"featured": true,
	"internship": true
}
```

## Testimonial APIs

Run `supabase/testimonials_new.sql` in Supabase SQL Editor. Testimonials are independent content; `program` is optional text used only for filtering.

Public route:

- `GET /api/testimonials`

Admin routes require an admin bearer token:

- `POST /api/admin/testimonials`
- `GET /api/admin/testimonials`
- `PUT /api/admin/testimonials/:id`
- `DELETE /api/admin/testimonials/:id`

Create body:

```json
{
	"name": "Ayesha Khan",
	"profileImage": "https://example.com/ayesha.jpg",
	"designation": "Web Development Intern",
	"program": "web-development",
	"rating": 5,
	"content": "The program and mentorship were excellent.",
	"featured": false,
	"status": "draft",
	"order": 1
}
```

## Partner APIs

Run `supabase/partners_new.sql` in Supabase SQL Editor.

Public:

- `GET /api/partners`

Admin routes require an admin bearer token:

- `POST /api/admin/partners` with multipart fields `name` and `logo` (image file), or JSON with a `logo` URL
- `DELETE /api/admin/partners/:id`