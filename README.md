# AralTech Hub

A free, DepEd-aligned reviewer platform for Filipino K-12 students — built with Next.js, Prisma, and PostgreSQL.

## Content hierarchy

Subject → Grade Level (tagged with curriculum framework) → Term (1-3) → Topic (tagged with competency code) → Lesson (MDX) → Quiz → Questions

### Reflects DepEd's SY 2026-2027 changes

- **3-term calendar**: DepEd Order No. 009, s. 2026 replaced the old 4-quarter system with 3 terms nationwide. The schema uses `Term` (1-3), not `Quarter`.
- **MATATAG rollout is phased**: only Grades 3, 6, and 9 are on the MATATAG curriculum this year — other K-10 grades are still MELC-based. Each `GradeLevel` row has a `framework` field (`MATATAG` or `MELC`) so you tag content correctly per grade+subject, not assume one system for all of K-10.
- **Strengthened SHS applies to Grade 11 only this year**: Grade 12 continues the old curriculum. `GradeLevel.framework` also covers `SHS_STRENGTHENED` vs `SHS_LEGACY`, and `GradeLevel.shsTrack` (`ACADEMIC` / `TECHPRO`) tags SHS subjects by track.
- **Double-check phase details before bulk-authoring content** — sources vary slightly on exactly which grades are in which MATATAG phase this year; confirm against the actual DepEd Order/BOW for the grade you're writing before publishing.

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your database**

   Create a free Postgres database on [Neon](https://neon.tech) or [Supabase](https://supabase.com), then create a `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed sample content** (a full Grade 7 Math Term 1 — Sets, Integers, Rational Numbers — so you have something real to click through)
   ```bash
   npx prisma db seed
   ```

5. **Set up login (Google + Facebook)**

   **Google:** go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials), create an OAuth Client ID (type: Web application), and add this as an authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **Facebook:** go to [developers.facebook.com/apps](https://developers.facebook.com/apps), create an app, add the "Facebook Login" product, and add this as a valid OAuth redirect URI:
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
   Note: while a Facebook app is in "Development" mode, only accounts you've added as testers/admins in the App Roles settings can log in with it — you'll need to submit it for App Review (requesting the `email` and `public_profile` permissions) before the public can use Facebook login.

   Copy all four client ID/secret values into `.env`, along with `NEXTAUTH_SECRET` (generate one with `openssl rand -base64 32`) and `NEXTAUTH_URL="http://localhost:3000"`.

6. **Run the dev server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`, sign in with Google or Facebook, and browse to a lesson to see the "Mark as complete" button and quiz score saving.

7. **Make yourself an admin**

   Sign in once first (so your `User` row exists), then run:
   ```bash
   npx ts-node prisma/make-admin.ts your-email@gmail.com
   ```
   Sign out and back in, and you'll see an "Admin" link in the header.

## What's included in this scaffold

- `prisma/schema.prisma` — full schema: content hierarchy, `CurriculumFramework`/`ShsTrack` tracking, NextAuth models (`Account`/`Session`/`VerificationToken`), `Role` (`STUDENT`/`ADMIN`), `Progress`, `QuizAttempt`
- `prisma/seed.ts` — full Grade 7 Math Term 1 content (6 lessons across 3 topics) plus a MATATAG-framework example
- `prisma/make-admin.ts` — CLI script to promote a signed-in user to `ADMIN`
- **Public site**: `/subjects` → subject → grade → term → topic → lesson, all statically generated, with MDX + KaTeX math rendering
- **Auth**: `lib/auth.ts` (NextAuth config, Google + Facebook providers, JWT sessions with role attached), `app/auth/signin/page.tsx` (custom sign-in page listing both), `middleware.ts` (protects `/admin` for admins only, `/account` for any logged-in user)

  **Note on account linking**: if a student signs up with Google using `name@gmail.com`, then later tries Facebook with an account using that same email, NextAuth will refuse to auto-link them (shown as an `OAuthAccountNotLinked` error on the sign-in page) — this is a deliberate security default, since Facebook doesn't always verify emails the way Google does. They'll need to keep using whichever method they signed up with first. Worth mentioning to students, or revisit `allowDangerousEmailAccountLinking` later if this causes real support headaches.
- **Student features**: "Mark as complete" button on every lesson (`components/MarkCompleteButton.tsx`), quiz attempts auto-saved for logged-in users (`components/QuizBlock.tsx`), `/account/progress` page showing completed lessons + quiz history
- **Admin content editor** (`/admin`): add subjects → add grade levels (auto-creates their 3 terms) → add topics → add/edit/delete lessons → edit MDX content → manage each lesson's quiz and questions. No more hand-editing `seed.ts` for new content.
- `lib/actions/admin.ts` / `lib/actions/student.ts` — server actions behind all of the above; admin actions independently re-check the `ADMIN` role server-side (not just via middleware), since server actions can be called directly

Every admin form is a real HTML form using Next.js Server Actions — no separate API layer to maintain.

## What's NOT included yet (your next steps)

- **SHS elective-cluster structure** — TechPro electives are grouped into clusters (ICT, Agri-Fishery, Automotive, etc.) that don't map cleanly onto the K-10 subject model yet
- **Search** — add Postgres full-text search or Meilisearch once you have enough lessons to make search useful
- **Admin reordering / bulk import** — topics and lessons order by an `order` field but there's no drag-and-drop UI yet; content is added one at a time
- **Deployment** — this only runs on `localhost` until you deploy it (e.g. to Vercel) and update `NEXTAUTH_URL` + the Google OAuth redirect URI to your real domain

## Suggested build order

1. ~~Seed 1 full term of one subject manually to prove out the content format~~ ✅ done in this scaffold
2. ~~Build subject/grade/topic listing pages so lessons are browsable~~ ✅ done in this scaffold
3. ~~Add auth + admin content editor + progress tracking~~ ✅ done in this scaffold
4. Deploy to Vercel + Neon (both have free tiers), update env vars for production, get it indexed by Google
5. Get a teacher or student to actually use it and tell you what's confusing or missing
