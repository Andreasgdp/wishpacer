# 1. Single Flex Scroll Container for Mobile Overlay Drawers

Date: 2026-09-21

## Status

Accepted

## Context

On mobile web viewports (especially iOS Safari), opening soft virtual keyboards when interacting with form inputs inside bottom drawers (Vaul `Drawer`) reduced the visual viewport height. Previously, `DrawerContent` used static layout viewport units (`max-h-[90vh]`) and contained nested `overflow-y-auto` scroll containers inside child forms (`WishModal`, `PlanSettingsModal`, etc.).

When lower form fields (such as Product Link, Notes, or Priority) were focused, iOS Safari attempted to scroll the layout viewport, shifting the `fixed` bottom overlay upward off-screen and obscuring form controls and drawer headers.

## Decision

We establish a unified single flex scroll container architecture for all mobile drawers presented via `ResponsiveOverlay`:

1. `DrawerContent` uses dynamic viewport height limits (`max-h-[85dvh] flex flex-col`) to automatically adapt to visual viewport changes when virtual keyboards expand.
2. `DrawerContent` maintains a non-shrinking handle/header section and delegates scrolling to a single flex body (`flex-1 min-h-0 overflow-y-auto`).
3. Child modal components presented inside `ResponsiveOverlay` must not declare secondary `overflow-y-auto` containers or duplicate outer padding (`p-4 sm:p-6`), ensuring focus auto-scroll stays contained within the primary drawer scroll viewport.
4. Vaul's input repositioning behavior is configured to prevent layout shifts during input focus.

## Consequences

- Prevents iOS Safari layout shifting and obscuration of drawer controls when virtual keyboards appear.
- Eliminates duplicate scrollbars and double padding across all mobile modal forms.
- Requires future modal components using `ResponsiveOverlay` to adhere to the single flex scroll container invariant.
