# Linking Bazel packages to non-bazel packages

The idea here is to use `link:../dist/bin/foo/foo_pkg` to link the npm builds that bazel produces to be
used locally with this package. This doesn't actually work because, while it works for top level dependencies,
packages like `bar` depend on `foo: 1.0.0`, which doesn't get converted to `link:../dist/bin/bar/bar_pkg`.
