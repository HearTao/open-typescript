# Contributing

## Run in local

```sh
rm -rf ts
git clone git@github.com:microsoft/TypeScript.git --depth=1 -b v4.7.2 ts
node ./src/rewrite.mjs ./ts
yarn --cwd ./ts gulp local
node ./src/convert.mjs ./ts/built/local -o ./libs/index.d.ts
node ./src/version.mjs ./ts -o .
```
