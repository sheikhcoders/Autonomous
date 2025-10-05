# Web Interface Guidelines

This document outlines the best practices and guidelines for building web interfaces in this project. These guidelines are a living, non-exhaustive list of decisions. Most are framework-agnostic, but some are specific to React/Next.js.

## Interactions

- **Keyboard Everywhere**: All user flows must be fully operable with a keyboard, adhering to the WAI-ARIA Authoring Patterns.
- **Clear Focus**: Every focusable element must have a visible focus ring. Use `:focus-visible` to avoid distracting pointer users and `:focus-within` for grouped controls.
- **Focus Management**: Implement focus traps and manage focus according to WAI-ARIA patterns (e.g., moving and returning focus).
- **Match Visual & Hit Targets**: Hit targets should match visual targets. If a visual target is smaller than 24px, expand its hit target to at least 24px. On mobile, the minimum size is 44px.
- **Mobile Input Size**: `<input>` font size must be ≥ 16px on mobile to prevent iOS Safari's auto-zoom. Alternatively, set `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />`.
- **Respect Zoom**: Never disable browser zoom.
- **Hydration-Safe Inputs**: Inputs must not lose focus or value after hydration.
- **Don’t Block Paste**: Never disable paste functionality in `<input>` or `<textarea>` elements.
- **Loading Buttons**: Show a loading indicator while retaining the original button label.
- **Minimum Loading State Duration**: For spinners or skeletons, use a show-delay (~150–300 ms) and a minimum visible time (~300–500 ms) to prevent flickering. React's `<Suspense>` component handles this automatically.
- **URL as State**: Persist application state in the URL to ensure that sharing, refreshing, and browser navigation (Back/Forward) work as expected.
- **Optimistic Updates**: Update the UI immediately on actions where success is likely. Reconcile with the server response and provide a rollback or "Undo" option on failure.
- **Ellipsis for Further Input**: Menu options that open a subsequent dialog (e.g., “Rename…”) should end with an ellipsis.
- **Confirm Destructive Actions**: Require user confirmation for destructive actions or provide an "Undo" option with a safe time window.
- **Prevent Double-Tap Zoom**: On touch controls, set `touch-action: manipulation`.
- **Custom Tap Highlight**: Ensure the tap highlight color (`webkit-tap-highlight-color`) matches the design.
- **Forgiving Interactions**: Design controls with generous hit targets, clear affordances, and predictable behavior.
- **Tooltip Timing**: Delay the first tooltip in a group; subsequent tooltips in the same group should appear without delay.
- **Overscroll Behavior**: Intentionally set `overscroll-behavior: contain` where appropriate (e.g., in modals or drawers).
- **Persistent Scroll Positions**: Ensure that Back/Forward navigation restores the previous scroll position.
- **Autofocus**: On desktop screens with a single primary input, use autofocus. Avoid autofocus on mobile to prevent layout shifts from the on-screen keyboard.
- **No Dead Zones**: If a part of a control looks interactive, it must be.
- **Deep-Link Everything**: Filters, tabs, pagination, and expanded panels should be linkable. Any state managed by `useState` should be considered for deep-linking.
- **Clean Drag Interactions**: Disable text selection and apply `inert` to elements while they are being dragged.
- **Links are Links**: Use `<a>` or `<Link>` for navigation to preserve standard browser behaviors (e.g., Cmd/Ctrl+Click). Do not use `<button>` or `<div>` for links.
- **Announce Async Updates**: Use `aria-live="polite"` for toasts and inline validation messages.
- **Locale-Aware Keyboard Shortcuts**: Internationalize keyboard shortcuts for non-QWERTY layouts and display platform-specific symbols.

## Animations

- **Honor Reduced Motion**: Provide a `prefers-reduced-motion` variant for all animations.
- **Implementation Preference**: Prefer CSS animations over JavaScript-driven animations. The preferred order is CSS > Web Animations API > JavaScript libraries (e.g., motion).
- **Compositor-Friendly**: Prioritize GPU-accelerated properties (`transform`, `opacity`) and avoid properties that trigger reflows/repaints (`width`, `height`, `top`, `left`).
- **Necessity Check**: Only use animations when they clarify cause and effect or add deliberate delight.
- **Appropriate Easing**: Choose easing functions based on the nature of the animation (size, distance, trigger).
- **Interruptible**: Animations must be cancelable by user input.
- **Input-Driven**: Avoid autoplay; animations should respond to user actions.
- **Correct Transform Origin**: Anchor motion to its physical starting point.
- **Never Transition `all`**: Explicitly list the properties to be animated.
- **Cross-Browser SVG Transforms**: Apply CSS transforms to `<g>` wrappers and set `transform-box: fill-box; transform-origin: center;` to avoid cross-browser rendering bugs.

## Layout

- **Optical Alignment**: Adjust by ±1px when perception is more important than geometric alignment.
- **Deliberate Alignment**: Every element must align intentionally with a grid, baseline, edge, or optical center.
- **Balance Contrast in Lockups**: Adjust weight, size, spacing, or color to balance text and icons that appear side-by-side.
- **Responsive Coverage**: Verify layouts on mobile, laptop, and ultra-wide screens.
- **Respect Safe Areas**: Account for notches and insets using safe-area variables.
- **No Excessive Scrollbars**: Only render useful scrollbars and fix overflow issues.
- **Let the Browser Size Things**: Prefer flexbox, grid, and intrinsic layout over JavaScript-based measurements.
- **Stable Skeletons**: Skeletons must mirror the final content layout to avoid layout shifts.

## Content

- **Inline Help First**: Prefer inline explanations over tooltips.
- **Accurate Page Titles**: The `<title>` tag should accurately reflect the current context.
- **No Dead Ends**: Every screen must offer a next step or a recovery path.
- **All States Designed**: Design for empty, sparse, dense, and error states.
- **Typographic Quotes**: Use curly quotes (“ ”) instead of straight quotes (" ").
- **Avoid Widows/Orphans**: Tidy up text rags and line breaks.
- **Tabular Numbers**: Use `font-variant-numeric: tabular-nums` for comparing numbers.
- **Redundant Status Cues**: Do not rely on color alone; include text labels.
- **Icons Have Labels**: Ensure icons have text labels for non-sighted users.
- **Don’t Ship the Schema**: Accessible names/labels must exist for assistive technologies even if they are not visually displayed.
- **Use the Ellipsis Character**: Use `…` instead of three periods (`...`).
- **Anchored Headings**: Set `scroll-margin-top` for headers to ensure correct positioning when linking to sections.
- **Resilient to User-Generated Content**: Layouts must handle content of varying lengths.
- **Locale-Aware Formats**: Format dates, times, numbers, delimiters, and currencies for the user’s locale.
- **Prefer Language Settings over Location**: Detect language via the `Accept-Language` header and `navigator.languages`.
- **Accessible Content**: Set accurate accessible names (`aria-label`), hide decorative elements (`aria-hidden`), and verify in the accessibility tree.
- **Icon-Only Buttons are Named**: Provide a descriptive `aria-label` for icon-only buttons.
- **Semantics Before ARIA**: Prefer native HTML elements (`<button>`, `<a>`, `<label>`) over ARIA roles.
- **Headings & Skip Link**: Use a hierarchical heading structure (`<h1>`–`<h6>`) and include a “Skip to content” link.
- **Brand Resources from Logo**: Allow users to right-click the navigation logo to access brand assets.
- **Non-Breaking Spaces**: Use `&nbsp;` to keep related terms together (e.g., `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`). Use `&#x2060;` for zero-width spaces where needed.