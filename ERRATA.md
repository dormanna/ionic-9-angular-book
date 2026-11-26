# Errata

Confirmed errors in the book *Ionic 9* (D&D Verlag Bonn) and in the code of this
repository, with their corrections.

Found something? Please open an issue with the **Erratum** template. It asks for the
section, the page and what you expected, which is what it takes to check a report.
Questions about Ionic in general are better placed in the
[Ionic Forum](https://forum.ionicframework.com/) or on
[Stack Overflow](https://stackoverflow.com/questions/tagged/ionic-framework).

## How to read this list

- **Section** and **page** refer to the printed book.
- **Tag** names the state of the code the correction applies to; where the code
  was fixed, a later commit on `main` carries the fix and says so.
- The newest entries are at the top.

## Security updates

### Capacitor 8.6.3 (26 November 2026)

Every tag that contains a native project, from `10.2` (iOS) and `10.4`
(Android) on, runs Capacitor 8.5.2. That version is affected by two
advisories published on 25 November 2026:

- [GHSA-jjx3-p5hf-mvvc](https://github.com/ionic-team/capacitor/security/advisories/GHSA-jjx3-p5hf-mvvc)
  (high, Android and iOS): internal proxy routes and path traversal let
  untrusted WebView content run at the app origin.
- [GHSA-2wpp-cw6c-mj9q](https://github.com/ionic-team/capacitor/security/advisories/GHSA-2wpp-cw6c-mj9q)
  (moderate, Android): a malformed content proxy request can crash the app.

Capacitor 8.6.3 fixes both, and `main` carries it. The tags stay as they
are, because they document the state each section of the book describes. If
you check out a tag and plan to run the app on a device, or build on it,
update Capacitor first, from the project root:

```bash
npm i -E @capacitor/core@8.6.3 @capacitor/ios@8.6.3 @capacitor/android@8.6.3 @capacitor/cli@8.6.3
npx cap sync
```

The plugins (`@capacitor/app`, `@capacitor/haptics` and the others) keep
their own version numbers and need no change for this.

## Confirmed errors

| Date | Section | Page | Printed | Correct | Code |
|---|---|---|---|---|---|
| | | | *No confirmed errors yet.* | | |
