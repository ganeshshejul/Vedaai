# VedaAI UI Implementation Documentation

## Overview
The VedaAI Teacher-Facing Web Application UI has been implemented using Next.js (App Router), React, and Tailwind CSS. The design strictly follows the provided Figma assets (Colors, Typography, Layouts).

## Technology Stack
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS (v4)
- **Icons:** `lucide-react`
- **Fonts:** Bricolage Grotesque (Google Fonts)

## Components Implemented
All core UI components are located in `apps/web/src/components/`.

### Layout Components
1. **Sidebar (`Sidebar.tsx`)**
   - Implements the left navigation bar.
   - Supports a `collapsed` prop to seamlessly shrink to an icon-only mode when navigating to specific screens (e.g., Loading Screen, Mapping Screen).

2. **TopNav (`TopNav.tsx`)**
   - Implements the top header containing the active page title, help icons, notification bell, and user profile.

### Screen Components
1. **Upload Area (`UploadArea.tsx`)**
   - Handles the file upload interface for both Question Paper and Answer Sheets.
   - Contains a built-in state toggle for demonstrating the **Empty State** and the **Filled State**.
   - Accessible via the root route `/`.

2. **Loading Area (`LoadingArea.tsx`)**
   - Provides a simulated loading view with a pulsing extracting animation.
   - Accessible via `/process`.
   - Uses the collapsed sidebar mode.

3. **Mapping Area (`MappingArea.tsx`)**
   - Implements the core Question-Answer mapping layout.
   - Responsive design: 
     - **Desktop:** Displays "Extracted Questions" on the left and the "Answer Sheet" on the right in a split-pane layout.
     - **Mobile:** Introduces a pill-shaped toggle at the top to switch between "Questions" and "Answer Sheet" views to accommodate smaller screens.
   - Accessible via `/mapping`.

## Design System Configuration
- **Global Theme Variables:** Defined in `globals.css`, matching the Figma `css.css` output.
- **Brand Colors:** Configured as Tailwind CSS variables:
  - `--color-primary-orange`: `#FF5623`
  - `--color-off-white`: `#F9F9F9`

## Future Enhancements
- Connect the simulated Upload State to the actual backend extraction workflow.
- Introduce actual draggable split panes for the Mapping screen (using a library like `react-split` or standard DOM events).
- Finalize the interactive bounding-box overlay functionality over real student answer sheet images in the Mapping Area.
