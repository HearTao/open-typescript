import * as fs from "fs";
import * as path from "path";
import { wrapDtsIntoDeclareModule } from "./wrap.mjs";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import url from "url";

const declarationFiles = ["typescript.d.ts", "tsserverlibrary.d.ts"];

const __filename = url.fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

const modulePrefix = "typescript/lib/";

function resolveModuleName(basename) {
    if (basename === "typescript") {
        return basename;
    }
    return modulePrefix + basename;
}

function handler() {
    return function handler1(argv) {
        const inputPath = argv.input;
        const outputPath = argv.output;

        if (!fs.statSync(inputPath).isDirectory()) {
            throw new Error("Input must be a directory");
        }

        const results = declarationFiles.map(file => {
            const filePath = path.join(inputPath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Cannot find file: ` + file);
            }

            console.log(`Started: [${filePath}]`);
            const content = fs.readFileSync(filePath).toString();
            const result = wrapDtsIntoDeclareModule(
                file,
                content,
                resolveModuleName(path.basename(file, ".d.ts"))
            );
            console.log(`Finished: [${filePath}]`);
            return result;
        });

        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        fs.writeFileSync(outputPath, results.join("\n"));
        console.log(`Combined: [${outputPath}]`);
    };
}

function main() {
    yargs(hideBin(process.argv))
        .strict()
        .command({
            command: `$0 <input> [options]`,
            handler: handler(),
            builder: yargs => {
                return yargs.positional("input", {
                    describe: "TypeScript Declaration files path",
                    type: "string",
                    normalize: true
                });
            }
        })
        .option("o", {
            alias: "output",
            describe: "Output file path",
            type: "string",
            requiresArg: true
        })
        .version()
        .alias("v", "version")
        .showHelpOnFail(true, "Specify --help for available options")
        .help("h")
        .alias("h", "help").argv;
}

main();
