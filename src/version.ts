import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";

interface Argv {
    input: string;
    output: string;
}

function handler() {
    return function handler1(argv: yargs.Arguments<Argv>): void {
        const inputPath = argv.input;
        const outputPath = argv.output;

        const inputPackageJsonPath = path.join(inputPath, "package.json");
        if (!fs.existsSync(inputPackageJsonPath)) {
            throw new Error("Input must have package.json");
        }

        const outputPackageJsonPath = path.join(outputPath, "package.json");
        if (!fs.existsSync(outputPackageJsonPath)) {
            throw new Error("Output must have package.json");
        }

        console.log(`Read version: [${inputPackageJsonPath}]`);
        const inputContent = fs.readFileSync(inputPackageJsonPath).toString();
        const inputPackageJson = JSON.parse(inputContent);

        console.log(`Write version: [${inputPackageJsonPath}]`);
        const outputContent = fs.readFileSync(outputPackageJsonPath).toString();
        const outputPackageJson = JSON.parse(outputContent);
        const now = new Date();
        outputPackageJson.version = `${
            inputPackageJson.version
        }-dev.${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
        fs.writeFileSync(
            outputPackageJsonPath,
            JSON.stringify(outputPackageJson, undefined, 4)
        );
        console.log(`Write version done`);
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
                    describe: "TypeScript repo path",
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
