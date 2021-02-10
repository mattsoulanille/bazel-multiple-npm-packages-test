# External Package

This package is external to the monorepo. It is for simulating an external user consuming monorepo packages.

## Setup
This external package depends on several monorepo packages, and it can't automatically build them because it's external to the monorepo. They have to be manually built and published. To do this, run `yarn  publish-all` in the root of the repo. You may have to increment version numbers of packages if you've published before, or just run the individual `publish-foo`, `publish-bar`, or `publish-build-with-both` commands to publish the parts that you haven't published yet. A third option is to delete Verdaccio's saved packages, which is located in `.local/share/verdaccio/` on linux.

## Running the package
Run `yarn update-and-test`. This command will pull all needed packages from Verdaccio / npm, build, and run / test the package.
