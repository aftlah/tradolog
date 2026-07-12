# Tradolog AI Development Rules

## Project Overview

Project Name: Tradolog

Tagline:

> Track Every Trade. Master Every Decision.

Tradolog is a premium Trading Journal SaaS application built for traders to journal, analyze, and improve trading performance.

Tradolog is NOT:

- Trading Platform
- Broker
- Crypto Exchange
- Copy Trading Platform

Tradolog IS:

- Trading Journal
- Trading Analytics
- Risk Management
- Performance Tracking
- Psychology Journal

The goal is to build a production-ready SaaS application.

---

# Tech Stack

Framework

- Astro 7

Language

- TypeScript (Strict)

UI

- React Islands

Styling

- Tailwind CSS v4

Component Library

- shadcn/ui

Database

- PostgreSQL

ORM

- Drizzle ORM

Authentication

- Better Auth

Storage

- Cloudflare R2

Deployment

- Vercel

Validation

- Zod

Forms

- React Hook Form

Charts

- Recharts

Tables

- TanStack Table

Animation

- Framer Motion

Icons

- Lucide React

Font

- Geist

---

# Project Architecture

Always use Feature Based Architecture.

```
src/
│
├── app/
│
├── db/
│   ├── schema/
│   ├── migrations/
│   ├── seeds/
│   └── index.ts
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── trade/
│   ├── analytics/
│   ├── calendar/
│   ├── goals/
│   ├── notes/
│   └── settings/
│
├── shared/
│   ├── components/
│   ├── ui/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── constants/
│   ├── config/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── styles/
│
└── middleware/
```

Never mix business logic with UI.

Never place database logic inside React components.

Never call repositories directly from UI.

UI → Service → Repository → Database

---

# Design Language

Tradolog uses a custom design language called

NeoGlass UI

Inspired by

- Linear
- TradingView
- Vercel Dashboard
- Arc Browser
- Apple VisionOS
- Notion

The interface should feel like a premium SaaS product released in 2026.

Always prioritize readability over visual effects.

---

# UI Style

Dark Mode First

Glassmorphism

Soft Neomorphic Shadows

Floating Panels

Minimal Interface

Large Whitespace

Professional Typography

Smooth Animations

Never use classic neumorphism.

Never use heavy gradients.

Never use excessive shadows.

---

# Color Palette

Background

#09090B

Surface

#18181B

Primary

#2563EB

Success

#22C55E

Danger

#EF4444

Warning

#F59E0B

Border

rgba(255,255,255,.08)

Text

#FAFAFA

Muted

#A1A1AA

---

# Radius

Cards

24px

Buttons

16px

Inputs

16px

Dialogs

24px

Sidebar

32px

---

# Glass Style

Cards

Glass Background

Backdrop Blur 24px

Opacity 5–8%

Soft Shadow

White Border 10%

Floating Effect

---

# Animations

Use Framer Motion.

Animation Duration

200–300ms

Allowed

- Fade
- Slide
- Scale
- Hover Lift
- Opacity

Never over animate.

---

# Code Standards

Always use Strict TypeScript.

Never use any.

Never duplicate logic.

Use SOLID.

Use DRY.

Prefer composition.

Keep components under 300 lines.

Split components when complexity grows.

Prefer named exports.

Avoid default exports.

Never hardcode values.

Use constants.

Use reusable hooks.

Use reusable utilities.

Use Environment Variables.

Never use magic numbers.

---

# Database Rules

Database

PostgreSQL

ORM

Drizzle ORM

Always use UUID primary keys.

Every table contains

- id
- created_at
- updated_at
- deleted_at

Always use

Foreign Keys

Indexes

Enums

Soft Delete

Timezone Aware Timestamps

UTC

Never cascade delete trading history.

Never duplicate values.

Always create migrations.

Never write raw SQL unless necessary.

---

# Authentication

Use Better Auth.

Support

- Email Login
- Google Login
- Forgot Password
- Reset Password
- Remember Me
- Protected Routes
- Session Management

---

# Storage

Store screenshots in Cloudflare R2.

Database stores URLs only.

Never store binary files inside PostgreSQL.

---

# Validation

Use Zod everywhere.

Validate

Forms

API

Services

Database Inputs

Never trust client-side data.

---

# Trading Rules

Trading calculations must NEVER exist inside UI components.

Create a reusable TradingCalculatorService.

TradingCalculatorService must be pure.

All Dashboard statistics must come from TradingCalculatorService.

Never calculate directly inside React components.

---

# Automatic Calculations

Automatically calculate

- Risk
- Reward
- Planned RR
- Actual RR
- Profit
- Loss
- Profit %
- Risk Amount
- Reward Amount
- Pips
- Holding Time
- Win Rate
- Profit Factor
- Expectancy
- Average RR
- Average Win
- Average Loss
- Largest Win
- Largest Loss
- Drawdown
- Maximum Drawdown
- Current Win Streak
- Current Loss Streak
- Maximum Win Streak
- Maximum Loss Streak
- Daily Return
- Weekly Return
- Monthly Return

Every calculation must automatically update after CRUD operations.

---

# Performance

Use Astro Islands.

Hydrate only interactive components.

Server render whenever possible.

Lazy load

Charts

Dialogs

Heavy Components

Optimize Images.

Optimize Bundle Size.

Memoize expensive calculations.

Avoid unnecessary hydration.

---

# Accessibility

Support

Keyboard Navigation

ARIA Labels

Focus Rings

Screen Readers

Proper Contrast

Semantic HTML

---

# Error Handling

Never throw raw errors.

Create custom error classes.

Centralize error handling.

Never expose internal server errors.

Always return typed errors.

---

# Logging

Never log

Passwords

Secrets

Tokens

Sensitive Information

Use structured logging.

---

# Security

Validate every request.

Validate every session.

Sanitize inputs.

Protect API routes.

Escape user generated content.

Rate limit authentication endpoints.

Never trust frontend data.

---

# Testing

Use

Vitest

Playwright

TradingCalculatorService must be unit-test friendly.

Business logic must never depend on UI.

---

# Cursor AI Behavior

Before generating code:

1. Inspect existing files.
2. Reuse existing implementations.
3. Never overwrite working code unnecessarily.
4. Explain architectural decisions before coding.
5. Follow Feature Based Architecture.
6. Generate production-ready code only.
7. Keep code modular and reusable.
8. Never scaffold duplicate functionality.
9. Complete one feature before moving to the next.
10. Keep code clean, readable, and maintainable.

---

# Development Workflow

Build one feature at a time.

Recommended order:

1. Foundation
2. Authentication
3. Database Schema
4. Trading Calculator
5. Dashboard Layout
6. Trade CRUD
7. Analytics
8. Calendar
9. Goals
10. Notes
11. Settings
12. Optimization
13. Testing
14. Production

Never implement multiple major features simultaneously.

Always finish one feature completely before starting the next.