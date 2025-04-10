# Routing Guide

This document outlines the routing logic in Markbyte's Frontend App.

---

## Overview

The app uses **React Router DOM** for client-side routing. Routing is handled inside `App.jsx`. Route rendering depends on user authentication status (`isAuthenticated`) and a loading check (`isLoading`).

---

## Route Definitions

| Path                          | Auth Required | Component Rendered             | Notes                                  |
|-------------------------------|---------------|---------------------------------|----------------------------------------|
| `/`                           | No/Yes         | `Home` / `BloggerHome`         | Based on auth state                    |
| `/about`                      | No            | `About`                         | Public static page                     |
| `/editor`                    | Yes            | `EditorPreview`                | Redirects to `Home` if unauthenticated |
| `/editor/:title/:version`    | Yes           | `PublishEditorPreview`         | Uses dynamic params                    |
| `/:user/:post`               | No           | `DynamicBlogPost`              | Dynamic blog post URL                  |
| `/:username`                 | No           | `BloggerLandingPage`           | Blogger’s public profile               |
| `/profile`                   | Yes           | `BloggerProfile`               | Requires authentication                |
| `/auth`                      | No/Yes         | `Auth` / `BloggerHome`         | Redirects if already logged in         |
| `*`                          | No            | `NotFound`                     | Catch-all route                        |

---

## Authentication-Aware Route Rendering

Some routes conditionally render based on authentication:

```tsx
element={
  isLoading ? null : !isAuthenticated ? <Home /> : <BloggerHome />
}
```

If the auth state is still loading, the route renders `null` to prevent flicker. Otherwise, it checks whether to redirect to `Home` or show the protected component.

---

## Dynamic Routes

The app includes several dynamic segments in the URL:

- `/editor/:title/:version` — loads a editor for specified post version
- `/:user/:post` — loads a post written by a user
- `/:username` — loads a user's profile

These are handled with React Router’s dynamic path syntax and consumed via `useParams()` inside the components.

---


## Toaster Integration

The `<Toaster />` component (shadcn) is mounted at the root level and will show global toast messages across all routes.

---

## Notes

- The `isAuthenticated` value is retrieved from a global `AuthContext`.
- The `isLoading` state ensures we don’t prematurely render routes before knowing the auth status.
- Some protected routes (e.g., `/editor`, `/profile`) fall back to `<Home />` if the user is not authenticated.
- The `*` wildcard route renders a custom 404 component for unmatched paths.

