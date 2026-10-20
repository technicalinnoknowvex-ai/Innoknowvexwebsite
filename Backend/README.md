# INNOKNOWVEX Backend

## Setup

1. Copy `.env.example` to `.env`.
2. Set the Supabase URL, anon key, and service-role key in `.env`.
3. Run `supabase/auth_new.sql` in the Supabase SQL Editor.
4. Start the backend with `npm run dev`.

The API allows requests from `http://localhost:3000`, the deployed site at
`https://www.innoknowvex.in`, and the previous Vercel deployment URL by default.
Set `FRONTEND_URL=https://www.innoknowvex.in` in production for authentication
redirects, and use the optional comma-separated `CORS_ORIGINS` variable to allow
additional frontend origins.

## Student guidance leads

Run `supabase/student_guidance_leads.sql` in the Supabase SQL Editor. The optional
website counselor form submits to `POST /api/leads`; the public API only inserts
validated leads and the table does not allow public reads.

## College partnership inquiries

Run `supabase/college_partnership_inquiries.sql` in the Supabase SQL Editor. The
About page's “Partner With Us” form submits to `POST /api/partnership-inquiries`.
Public access is limited to validated inserts; inquiry records cannot be read by
anonymous website visitors.

## Careers and job applications

Run `supabase/careers.sql` in the Supabase SQL Editor. Admin users can create, edit,
publish, and archive jobs in the website admin dashboard. Job postings do not have
application deadlines. The public Careers page shows published jobs and accepts
applications at `POST /api/careers/applications`. Applicants must upload a PDF resume
(up to 5 MB); the backend stores it in the private `job_resumes` Supabase Storage
bucket using `SUPABASE_SERVICE_ROLE_KEY`, then stores its object path in
`career_applications.resume_path`. Keep the service-role key configured only on the
backend. The bucket is private so resume files are not exposed as public URLs.

## Razorpay payments

Set these variables in the **backend** environment; never put the secret or webhook
secret in the frontend:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: the Razorpay Key ID shown in the same account and
  mode (Test or Live) as the key secret. The `NEXT_PUBLIC_` prefix is retained as the
  requested variable name, but this value is read by the backend and returned only as
  the public Checkout key.
- `RAZORPAY_KEY_SECRET`: the matching server-only Key Secret.
- `RAZORPAY_WEBHOOK_SECRET`: a separate secret configured for the webhook endpoint.

The backend still accepts the legacy backend-only `RAZORPAY_KEY_ID` variable as a
fallback. Prefer `NEXT_PUBLIC_RAZORPAY_KEY_ID` for new configuration, and remove the
legacy key if both variables are present. Use a matching Test pair for test payments
and a matching Live pair for live payments. A Razorpay “Invalid API key” response
means the configured ID and secret do not match or are from different modes; rotate
any key that has been shared outside the backend environment.

Apply `supabase/program_enrollments.sql` to create or update the enrollment table and
its checkout idempotency index. Configure a Razorpay webhook for
`POST /api/payments/webhook` with the `payment.captured` and `order.paid` events, and
set the webhook's separate signing secret as `RAZORPAY_WEBHOOK_SECRET`.

Create orders with authenticated `POST /api/payments/orders` and verify Checkout
responses with authenticated `POST /api/payments/verify`. The server reads prices from
`program_pricing_new`; client-provided prices are ignored. The webhook and authenticated
verification endpoint both mark an enrollment paid only after validating the payment.

## Authentication routes

- `POST /api/auth/register` with `{ "fullName", "email", "password", "confirmPassword", "redirectTo"? }`
- `POST /api/auth/login` with `{ "email", "password" }`
- `POST /api/auth/logout` with `Authorization: Bearer <access_token>`
- `GET /api/auth/me` with `Authorization: Bearer <access_token>`
- `POST /api/auth/forgot-password` with `{ "email", "redirectTo"? }`
- `POST /api/auth/reset-password` with `{ "password" }` and `Authorization: Bearer <access_token>`

To require email verification before login, enable email confirmations in Supabase Auth settings and add `${FRONTEND_URL}/auth/student/login` and `${FRONTEND_URL}/auth/admin/login` to the allowed redirect URLs. The backend uses `FRONTEND_URL` (default `http://localhost:3000`) as the verification email destination. Admin signup may request the `/auth/admin/login` verification destination; all other signups use the student login page.

## Roles

Protected routes use `authenticate`. Admin-only routes must use both middleware functions:

```js
router.get("/admin-example", authenticate, adminOnly, controller.adminExample);
```

The accepted roles are `admin` and `student`/`user`. Roles are read from Supabase `app_metadata.role`, which must be assigned server-side; public clients cannot grant themselves admin access through `user_metadata`.

The website admin interface is served by the main frontend at `/auth/admin`. New admin signups create a normal Supabase Auth account only; a trusted operator must approve the account by setting `app_metadata.role` to `admin` in Supabase Auth before it can access admin endpoints. The dashboard manages programs, categories, blogs, testimonials, and partners through the authenticated `/api/admin/*` routes. After changing a user's app metadata, have them sign in again so their access token contains the updated role.

The reset-password request uses the access token Supabase provides after the recovery link is opened. Supabase's managed `auth.users` table cannot be renamed; the application-owned profile table is named `user_profiles_new`.

The `user_profiles_new` table stores `id`, `full_name`, `email`, `created_at`, and `updated_at`. The signup trigger copies `full_name` from user metadata and `email` from `auth.users`. Run `supabase/user_profiles_new_portfolio.sql` to add the `skills` and `projects` columns used by the student dashboard.

## Program APIs

Run `supabase/programs_new.sql` in Supabase SQL Editor before using these routes.
Run `supabase/program_pricing_new.sql` as well to create and seed the pricing table from the supplied CSV. Rows where all six prices are `0.00` were intentionally excluded.
Run `supabase/storage_new.sql` to create the public media buckets and admin-only upload policies.

Admin media uploads use `multipart/form-data`, with a maximum file size of 10 MB. Program uploads use `image` for an image and `brochure` for a PDF. Blog image uploads use `image` and the `blog_images` bucket. Testimonial uploads use `profileImage`, and partner uploads use `logo`. The resulting public Storage URLs are saved in the related table.

When replacing a program image or brochure, the backend reuses the existing object path in its Storage bucket and upserts the new file there. This keeps the file in the same program folder and updates the program row's public URL with a cache-busting query value. The admin Storage `SELECT`, `INSERT`, and `UPDATE` policies from `supabase/storage_new.sql` must be applied for replacements to work.

Blog images use the same Storage replacement flow: a replacement reuses the existing object path in `blog_images`, and its public URL is saved to `blogs_new.image_url`. Testimonial profile image replacements reuse the existing object path in `testimonial-images` and update `testimonials_new.profile_image`.

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
- Partner records include a `type`: `brand` or `hiring partners`.

Admin routes require an admin bearer token:

- `POST /api/admin/partners` with `name`, optional `type` (`brand` by default, or `hiring partners`), and either a multipart `logo` image or a JSON `logo` URL
- `DELETE /api/admin/partners/:id`