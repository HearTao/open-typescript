import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import { wrapDtsIntoDeclareModule } from "./wrap";

interface Argv {
    input: string;
    output: string;
}

const declarationFiles = [
    "typescriptServices.d.ts",
    "typescript.d.ts",
    "tsserverlibrary.d.ts"
];

const modulePrefix = "typescript/lib/";

function resolveModuleName(basename: string) {
    if (basename === "typescript") {
        return basename;
    }
    return modulePrefix + basename;
}

function handler() {
    return function handler1(argv: yargs.Arguments<Argv>): void {
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

        fs.writeFileSync(outputPath, results.join("\n"));
        console.log(`Combined: [${outputPath}]`);
    };
}

function main() {
    yargs
        .strict()
        .command({
            command: `$0 <input> [options]`,
            handler: handler(),
            builder: (yargs: yargs.Argv<any>): yargs.Argv<any> => {
                return yargs.positional("input", {
                    describe: "TypeScript Declaration files path",
                    type: "string",
                    normalize: true
                });
            }
        })
        .option("o", {
            alias: "output",
            describe: "Output directory",
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
