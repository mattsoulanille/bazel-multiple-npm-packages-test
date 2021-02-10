# bazel-multiple-npm-packages-test
A test of publishing multiple interdependent npm packages from a Bazel monorepo

## Setup
To install dependencies, run `yarn`.

To demonstrate publishing to npm, this demo uses [verdaccio](https://verdaccio.org/), a private npm proxy. 
To install verdaccio, run:
```sh
yarn global add verdaccio
```
Then, run `verdaccio` and look for where its config file is loaded from (should be the first line logged). 
Edit the config to allow anyone to publish scoped packages and restart verdaccio:
```yml
config.yml
...
packages:
  '@*/*':
    # scoped packages                                                           
    access: $all
    publish: $anonymous
    unpublish: $anonymous
    proxy: npmjs
...
```

## Examples
__These examples mostly assume you're starting from scratch in a new repo (although they can apply to an existing repo given enough refactoring). Check the `build_with_both` directory for details on what I think is a good way to convert a package in a JS monorepo to use Bazel.__
### Bazel Primer
[Bazel](https://docs.bazel.build/versions/4.0.0/bazel-overview.html) is an open-source build toolchain developed by Google.
It uses BUILD files to define targets that can be built or run and dependencies between targets. 
### Compiling TypeScript
TypeScript is compiled by the 
[`ts_library` rule](https://bazelbuild.github.io/rules_nodejs/TypeScript.html#compiling-typescript-ts_library).
As an example, take a look at the `foo_lib` target in
[`foo/BUILD.bazel`](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/blob/main/foo/BUILD.bazel#L6):
```starlark
ts_library(
    name = "foo_lib",
    module_name = "@test_scoped_repo/foo",
    visibility = ["//visibility:public"],
    srcs = [
        "foo.ts",
    ],
    deps = [
        "//foo/bla:bla_lib",
    ],
)
```

This target defines a TypeScript library named `foo_lib` that compiles the `foo.ts` source file and depends on the
`//foo/bla:bla_lib` TypeScript library. It's publicly visible in the project and has the amd module name `@test_scoped_reop/foo`.

To compile this target, run `bazel build //foo:foo_lib` (or `yarn bazel build //foo:foo_lib`). If you look in the `foo/`
directory, you'll see that there are no new files created by building the target. That's because Bazel puts
all of its outputs in an [output directory](https://docs.bazel.build/versions/master/output_directories.html)
somewhere else and places symlinks to that directory in the root of the project.
In the case of this repo, the symlinks are located in `dist/`, but that can be configured by editing 
[`.bazelrc`](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/blob/main/.bazelrc).

Take a look in `dist/bin/foo/`. That directory should contain the results of compiling `foo.ts`. It also contains the `bla/`
subdirectory, which has the results of compiling `foo/bla/bla.ts`, which `foo.ts` depends on. `bla.ts` was compiled because
the `foo_lib` target listed `bla_lib` in its `deps` attribute. For more information on how to declare these dependencies, see the
documentation on [Bazel Labels](https://docs.bazel.build/versions/master/build-ref.html#labels) and the 
[`ts_library`](https://bazelbuild.github.io/rules_nodejs/TypeScript.html#ts_library) documentation.

### Writing Tests
[rules_nodejs](https://bazelbuild.github.io/rules_nodejs/) provides the 
[`jasmine_node_test`](https://bazelbuild.github.io/rules_nodejs/Jasmine.html) rule for running jasmine tests. As an example,
we'll look at how to test the `foo_lib` target.

Since [`foo_test.ts`](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/blob/main/foo/foo_test.ts)
is written in TypeScript but `jasmine_node_test` requires JavaScript inputs, we first declare a `ts_library` target named
`foo_test_lib` to compile it. since `foo_test_lib` depends on `foo.ts`, it needs the `:foo_lib` target in its `deps` attribute.
It also needs jasmine typings, so we add `@npm//@types/jasmine` to its deps (rules_nodejs automatically generates targets for all
installed npm packages. Note that
[we're actually using yarn](https://github.com/mattsoulanille/bazel-multiple-npm-packages-test/blob/main/WORKSPACE#L16-L20),
but the convention is to use the name `npm` for the generated workspace's name).

`foo_test_lib` now compiles to a `.js` file (`dist/bin/foo/foo_test.js`) that `jasmine` can run. Instead of running this 
file with jasmine, we'll use the `jasmine_node_test` rule to run it by creating a new target named `foo_test` and passing it
the `:foo_test_lib` target as a source.
```starlark
ts_library(
    name = "foo_test_lib",
    testonly = True,
    srcs = [
        "foo_test.ts",
    ],
    deps = [
        ":foo_lib",
        "@npm//@types/jasmine",
    ],
)

jasmine_node_test(
    name = "foo_test",
    srcs = [
        ":foo_test_lib",
    ],
)
```
To run the test target, run `bazel run //foo:foo_test`, or run `bazel test //foo:foo_test`.
By default, `bazel test` shows minimal information about the test, just printing whether it passed or failed, and is best used for
running multiple tests at once.

### Publishing to npm
Alex Eagle has a 
[great writeup on how to do this](https://medium.com/@Jakeherringbone/multiple-npm-packages-in-a-bazel-monorepo-5072f2aebdb2).
This section covers how it's done in this repo. 

`rules_nodejs` provides the [`pkg_npm`](https://bazelbuild.github.io/rules_nodejs/Built-ins.html#pkg_npm) rule for `tar`ing and 
publishing a package to npm, but there are a few caveats to keep in mind when doing this.
1. The package needs its own `package.json` that declares its dependencies and name.
2. The package name in `package.json` should be the same as the `module_name` in the root `ts_library`. All other importable `ts_library` targets should also set `module_name` to the corresponding path relative to where they appear in the filetree (take a look at `foo/bla` for an example). This makes sure imports look the same whether the module is loaded from bazel or from npm and is why the `bar` package works in bazel and in npm.

To publish `foo` and `bar` to npm (verdaccio), start verdaccio and run `yarn publish-all` in the root of the repo. This will run the following commands:
```sh
bazel run //foo:foo_pkg.publish -- --registry http://localhost:4873
bazel run //bar:bar_pkg.publish -- --registry http://localhost:4873
```
To simulate an external user consuming the packages, cd to `external_package` and run `yarn install-local` (to use verdaccio). Run `yarn tsc` to build and `node dist/external_package.js` to run the result.


