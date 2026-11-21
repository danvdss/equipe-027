/** Verifies the checked-in browser bundle before publication on GitHub Pages. */
"use strict";
const { verifyPublishedBundle, assertPublicRepoIgnored } = require("./prepare-private-to.cjs");
assertPublicRepoIgnored();
const data = verifyPublishedBundle();
console.log(
  "GitHub Pages: Projeto-TO verified; private source " +
    data.commit.slice(0, 12) + ", " + data.bytes + " public client bytes."
);
