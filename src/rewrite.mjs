import { js } from "@ast-grep/napi";
import fs from "fs";
import path from "path";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import MagicString from "magic-string";
import url from "url";

const dtsBundlerPath = "scripts/dtsBundler.mjs";

const __filename = url.fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

/**
 * Replace the local variable name of the import statement
 */
const replaceImportTypeScript = source => {
    const magic = new MagicString(source);

    const ast = js.parse(source); // 1. parse the source
    const root = ast.root(); // 2. get the root
    const node = root.find({
        rule: {
            pattern: `import ts from "$TS";`
        }
    });

    // 3. find the node
    const localNode = node.getMatch("TS");
    const localNodeText = localNode.text();

    const range = localNode.range();
    magic.overwrite(range.start.index, range.end.index, "./ts.mjs");

    const result = magic.toString();
    return result;
};

function handler() {
    return function handler1(argv) {
        const inputPath = argv.input;

        if (!fs.statSync(inputPath).isDirectory()) {
            throw new Error("Input must be a directory");
        }

        const hackedTsPath = path.join(__dirname, "../fixtures/ts.mjs");
        const targetPath = path.join(inputPath, "scripts/ts.mjs");
        const bundlerPath = path.join(inputPath, dtsBundlerPath);
        fs.copyFileSync(hackedTsPath, targetPath);

        let fileContent = fs.readFileSync(bundlerPath, "utf-8");
        fileContent = replaceImportTypeScript(fileContent);

        fs.writeFileSync(bundlerPath, fileContent);

        console.log(`Rewrite done`);
    };
}

function main() {
    yargs(hideBin(process.argv))
        .strict()
        .command({
            command: `$0 <input>`,
            handler: handler(),
            builder: yargs => {
                return yargs.positional("input", {
                    describe: "TypeScript repo path",
                    type: "string",
                    normalize: true
                });
            }
        })
        .version()
        .alias("v", "version")
        .showHelpOnFail(true, "Specify --help for available options")
        .help("h")
        .alias("h", "help").argv;
}

main();
