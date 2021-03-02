import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";

interface Argv {
    input: string;
}

const jsonConfigFiles = [
    "src/tsconfig-library-base.json",
    "src/tsc/tsconfig.release.json"
];

function handler() {
    return function handler1(argv: yargs.Arguments<Argv>): void {
        const inputPath = argv.input;

        if (!fs.statSync(inputPath).isDirectory()) {
            throw new Error("Input must be a directory");
        }

        jsonConfigFiles.forEach(jsonFile => {
            const jsonPath = path.join(inputPath, jsonFile);
            if (!fs.existsSync(jsonPath)) {
                throw new Error(`Cannot find file: ` + jsonFile);
            }

            console.log(`Rewrite: [${jsonPath}]`);
            const content = fs.readFileSync(jsonPath).toString();
            const packageJson = JSON.parse(content);

            if (
                packageJson.compilerOptions &&
                packageJson.compilerOptions.stripInternal
            ) {
                packageJson.compilerOptions.stripInternal = false;
            }
            fs.writeFileSync(
                jsonPath,
                JSON.stringify(packageJson, undefined, 4)
            );
        });
        console.log(`Rewrite done`);
    };
}

function main() {
    yargs
        .strict()
        .command({
            command: `$0 <input>`,
            handler: handler(),
            builder: (yargs: yargs.Argv<any>): yargs.Argv<any> => {
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
