# BoB Tours

The example app from the book **“Ionic 9: Create awesome and AI-able apps for
any platform”** by Andreas Dormann (D&D Verlag Bonn) —
[the book's page for this code](https://ionic.andreas-dormann.de/ionic-9-book-code/).
A tour app for Bonn, built with Ionic 9 and Angular 22 and shipped through
Capacitor 8 to iOS, Android and the web. `api/` holds a small Node server that
serves the catalog and takes requests; it has no dependencies of its own.

## One tag per section

The book builds this app from the first command to the store, and every state it
passes through is a tag. `6.8` is the app at the end of section 6.8, so to start
section 6.9 with the book's code, check out `6.8`:

```bash
git clone https://github.com/dormanna/ionic-9-angular-book
cd ionic-9-angular-book
git checkout 6.8
npm install
```

Chapters 3 to 5 were built in one go and carry fewer tags: `3.1` is the project
exactly as `ionic start` leaves it, and `3.6`, `4.6` and `5.5` close those three
chapters. From chapter 6 on, and in both bonus chapters, every section has its
tag; where a section changes no code, its tag marks the state before it.

**A state shows the app at that point in the book, not at the end of it.** Where
a section tries something out that the next one takes away again, its tag still
has it. That is not a lost commit, and the section says so.

`npm install` belongs to every switch: the dependencies change along the way.
Without Git, the repository page offers every tag as a ZIP.

## Running it

```bash
ionic serve               # the dev server, http://localhost:8100
node api/server.mjs       # the API, in a second terminal
```

The app expects Node 26 (Node 24 works too) and the Ionic CLI. Chapter 1 of the
book walks through the installation.

## What comes with the repository

Some things are here because nobody should have to type them: the server in
`api/` from `5.5`, the tour photographs from `6.8`, the complete German
translation from `12.7`, the framework-free page of bonus chapter 1 in
`no-framework/` from `B1.2`, and the container that bounds an AI assistant in
`sandbox/` from `B2.8`.

## Found a mistake?

Please open an issue with the **Erratum** template: it asks for the section, the
page and what you expected, which is what it takes to check a report. Confirmed
errors are collected in [ERRATA.md](ERRATA.md). Questions about Ionic in general
are better placed in the [Ionic Forum](https://forum.ionicframework.com/) or on
[Stack Overflow](https://stackoverflow.com/questions/tagged/ionic-framework).

## License

The code is MIT, see [LICENSE](LICENSE). The photographs, the logo and the icons
are not part of that: the photographs are Andreas Dormann's own, and the two
framework logos in bonus chapter 1 belong to their projects — React's is a
trademark of Meta Platforms, Inc., and Vue's was designed by Evan You and is used
under the CC BY-NC-SA 4.0 license.
