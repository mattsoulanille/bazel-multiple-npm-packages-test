# Build with Both
This directory shows an example package that can be built and published with yarn or Bazel. 

## Why is this useful
This shows what I think is a reasonable way to convert a normal TypeScript package into a Bazel monorepo package while maintaining both builds. It's most applicable to a refactor where you'd want to add Bazel without breaking the existing build system and then remove the `yarn`-based build system once the Bazel build works.

## Building and Publishing
First, make sure Verdaccio is running. See the root readme for details. Between these following builds, you might want to try out using the package externally. See the section below on __Consuming the package externally__ for a premade example.

### Yarn
Run `yarn publish-yarn`. This command will run `tsc` to compile everything in `src` and output it to `dist`, and then it runs `yarn publish` (with the registry set to Verdaccio). It works like most other TypeScript repositories work.

### Bazel
Run `yarn publish-bazel` and make sure to increment the version number when it asks. This command first runs `yarn version` to increment the version number and then runs
```sh
bazel run :build_with_both_pkg.publish -- --registry http://localhost:4873
```
The last half of the command, `-- --registry http://localhost:4873`, just tells npm to use Verdaccio (the two dashes with no argument signify the split between arguments to Bazel and arguments to the program it's running).

The first half runs the `.publish` label of [`pkg_npm`](https://bazelbuild.github.io/rules_nodejs/Built-ins.html#pkg_npm). This single command builds and publishes the repo. [`BUILD.bazel`](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/blob/main/build_with_both/BUILD.bazel) contains the definition of this label:
```starlark
pkg_npm(
    name = "build_with_both_pkg",
    srcs = [
        "package.json",
    ],
    deps = [
        ":example_lib",
    ],
)
```
When `build_with_both_pkg.publish` is run, it includes the `package.json` listed in `srcs` and the outputs of `example_lib` listed in `deps` (which it automatically rebuilds if necessary). The `example_lib` label refers to the `ts_project` defined below.
```starlark
ts_config(
    name = "example_lib_tsconfig",
    src = "tsconfig.json",
    deps = [
        "//:tsconfig.json",
    ],
)

ts_project(
    name = "example_lib",
    declaration = True,
    srcs = glob(["src/**/*.ts"]),        
    out_dir = "dist",
    root_dir = "src",
    source_map = True,
    tsconfig = ":example_lib_tsconfig",
)
```

This example uses the `ts_project` rule because [it best mirrors what `yarn tsc` is doing](https://bazelbuild.github.io/rules_nodejs/TypeScript.html) and it allows us to output the compilation results in the `dist` directory, the same as the `yarn` build. Using `ts_library` would force the results to be produced in the `src` directory. While it may be better to use `ts_library` in the long run, this example is illustrating a no-op refactor that doesn't change how the npm package looks.

`ts_project` runs `tsc --project`, which then compiles the project normally, compiling all the source `.ts` files that match `src/**/*.ts`. `out_dir` is required to make sure the results end up in `dist` (really `/dist/bin/build_with_both/build_with_both_pkg/dist/`) and `root_dir` prevents them from being put in `dist/src/` by specifying the root directory of compilation. `ts_config` is used to allow this package's tsconfig to depend on the monorepo's root tsconfig.


## Consuming the package externally
To consume the package externally, we'll use the [external_package](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/tree/main/external_package) example. Its instructions should work, but you'll probably have to run `publish-foo` and `publish-bar` instead of `publish-all` since you've probably already published this package.

## TODO:
Add a rollup example. Add example tests. 
