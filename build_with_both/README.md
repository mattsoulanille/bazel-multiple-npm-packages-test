# Build with Both
This directory shows an example package that can be built and published with yarn or Bazel. 

## Why is this useful
This shows what I think is a reasonable way to convert a normal TypeScript package into a Bazel monorepo package.

## Building and Publishing
First, make sure Verdaccio is running. See the root readme for details. Between these following builds, you might want to try out using the package externally. See the section below on __Consuming the package externally__ for a premade example.

### Yarn
Run `yarn publish-yarn`. This command will run `tsc` to compile everything in `src` and output it to `dist`, and then it runs `yarn publish` (with the registry set to Verdaccio). It works like most other TypeScript repositories work.

### Bazel
Run `yarn publish-bazel` and make sure to increment the version number when it asks. More details on what this is doing are being written right now.


## Consuming the package externally
To consume the package externally, we'll use the [external_package](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/tree/main/external_package) example. Its instructions should work, but you'll probably have to run `publish-foo` and `publish-bar` instead of `publish-all` since you've probably already published this package.

## TODO:
Add a rollup example. Add example tests. 
