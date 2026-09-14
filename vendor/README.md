# Reviewed Jalangi runtime subset

Source: https://github.com/Samsung/jalangi2 at bc879287b1678de6e3c423f5debe63207559525b.
The Apache-2.0 license and upstream notices are retained. Only instrumentation/runtime headers and implementation files are included; browser/server dependencies are not installed. The adapted command retains the original analysis order, transpiles modern source through TypeScript6, records source maps and does not rewrite source files. This subset was verified through actual CommonJS traces, not a claim of equivalence for every Jalangi profile.
