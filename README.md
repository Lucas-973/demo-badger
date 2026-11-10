# Badger UH Map

Standalone customer playtest fork of the UH Map. This directory is self-contained and can be copied to its own repository. The original PMS app is unchanged.

The original 256-room inventory, categories, rates, capacities, bed layouts, and characteristics are retained. Every room starts vacant and clean. There are no seeded bookings, guest names, VIP labels, staff assignments, maintenance notes, or stay dates.

The original topbar and primary sidebar remain visible with Rooms selected. Both shell regions are inert: mouse and keyboard input cannot activate navigation, global search, the suite launcher, booking shortcuts, Copilot, settings, or profile menus. The UH Map and its dialogs remain interactive. As in the original Rooms screen, no secondary sidebar is shown. Other PMS screens are excluded.

Room search, filters, grid/compact modes, grouping, walk-ins, check-in, history, and room-status actions use the existing components. Creating a walk-in checks the guest in and marks the room occupied before optional key encoding. Skipping encoding or closing that step leaves the guest checked in. Rate plans are retained as room configuration. Key encoding remains a demo; no hardware or external service is contacted.

All changes are kept in browser memory for the current page. Reloading resets rooms and clears bookings. Visitors do not share data. No backend or environment variables are required.

## Manual validation

From this directory:

```powershell
npm ci
npm run build
npm run dev
```

Confirm all 256 rooms are vacant with no arrivals or departures. Verify the topbar and sidebar stay visible, cannot be activated by mouse, and are skipped when tabbing. Try the map's search, filters, grouping, and compact mode. Create walk-ins and try skipping encoding, completing encoding, and closing the encoding step; each must leave the guest checked in, the room occupied, and no pending arrival. Inspect history. Change room status and set an out-of-order period. Reload and confirm bookings and operational changes are cleared. Check a narrow viewport as well.

Builds and tests were not run during extraction, as requested.

## Vercel

Import the repository into Vercel and set **Root Directory** to `uh-map`. If you copy this folder into its own repository, use that repository's root instead.

Use the Vite preset, install command `npm ci`, build command `npm run build`, and output directory `dist`. The included `vercel.json` declares the framework, build command, and output directory. No environment variables are needed.

Deploy the project and share its URL with testers. This fork has not been deployed as part of the extraction.
