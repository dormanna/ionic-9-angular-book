# BoB Tours

A tour app for Bonn, built with Ionic 9 and Angular 22 and
shipped through Capacitor 8 to iOS, Android and the web.
`api/` holds a small Node server that serves the catalog and
takes requests; it has no dependencies.

## Commands

- `npm start` — the dev server
- `node api/server.mjs` — the API, in a second terminal
- `npm test` — Vitest, through `ng test`
- `npm run lint`
- `npm run build`

## House rules for code

- Standalone components. No `NgModule`. Import `Ion*`
  components from `@ionic/angular`.
- New control flow: `@if`, `@for`, `@switch`, never `*ngIf`
  or `*ngFor`. Every `@for` has a `track`.
- Signals for component state. The app is zoneless, so state
  changed inside an unwrapped async callback does not
  re-render on its own.
- `@Service()`, not `@Injectable({ providedIn: 'root' })`.
- `inject()`, not constructor injection.
- Lazy loading with `loadComponent`.
- Strict TypeScript stays on. Do not weaken `tsconfig` to
  make code compile.
- Icons are registered explicitly with `addIcons()`.
- Logic that computes something lives in a plain function
  with its own test.
- Code that talks to a plugin, the device or the network
  has a test of its own against a fake of that outside,
  even when the tests of its callers replace it.

## Permissions

- Ask for a permission when the user needs the feature, not
  on start.
- Keep the app usable when a permission is denied or the
  feature behind it fails, and tell the user why it is
  unavailable.
- Every permission the app asks for is configured on both
  platforms: a usage description the user can read on iOS,
  the permission in the manifest on Android.

## Two languages

The interface is English and German. Every text the app
shows or has read out carries an `i18n` marker whose id
reads `area.element` — in templates as `i18n` and
`i18n-label` attributes, in TypeScript through `$localize`.
Every new id needs its German text in
`src/assets/i18n/de.json`. Tour data from the API is
content, not interface, and carries no marker.

## Commits

One line, with a paragraph below it when the reason needs
one. Never push; commit locally.
