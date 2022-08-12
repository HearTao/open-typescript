# Contributing

## Run in local

```sh
rm -rf ts
git clone git@github.com:microsoft/TypeScript.git --depth=1 -b v4.7.2 ts
node ./dist/rewrite.js ./ts
yarn --cwd ./ts gulp local
node ./dist/convert.js ./ts/built/local -o ./libs/index.d.ts
node ./dist/version.js ./ts -o .
```
