# Interio AR — Furniture Placement

Interio is an Augmented Reality (AR) furniture placement web application prototyped for the **3PO642 Product Management** course.

Created by: Eldar, Mia, Maria, and Dina.

## Overview
Interio allows users to preview furniture items from popular Czech retailers (Alza, Bonami, XXXLutz) in interactive 3D directly in their browser. Users can then visualize these items in their own physical space using Augmented Reality (AR) without needing to download any specialized mobile application.

## Key Features
- **Interactive 3D Furniture Browser**: Browse through a curated catalog of beds, sofas, tables, and chairs.
- **Web-based AR Placement**: View any furniture item in your actual room using your mobile device's camera (powered by Google's `<model-viewer>`).
- **Multi-Item AR Session**: Arrange multiple pieces of furniture together to see how they fit and match in a single combined AR scene.
- **Favorites & User Accounts**: Sign in to save your favorite products and plan your interior redesign later.
- **Bilingual Support**: Fully localized in English and Czech.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS v4
- **3D & AR**: `@google/model-viewer`, Three.js
- **Backend & Auth**: Supabase
- **Deployment**: Vercel

## Getting Started

First, ensure you have all dependencies installed:

```bash
npm install
```

Make sure your environment variables in `.env.local` are set up pointing to your Supabase instance.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Required Device Hardware for AR
While the 3D previews function on any standard web browser, utilizing the "View in AR" functionality requires a mobile device with AR capabilities:
- **Android**: ARCore-supported device.
- **iOS**: ARKit-supported device.
