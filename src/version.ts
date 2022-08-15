import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";

interface Argv {
    input: string;
    output: string;
    distTag: "dev" | "latest";
}

function handler() {
    return function handler1(argv: yargs.Arguments<Argv>): void {
        const inputPath = argv.input;
        const outputPath = argv.output;
        const distTag = argv.distTag;

        const inputPackageJsonPath = path.join(inputPath, "package.json");
        if (!fs.existsSync(inputPackageJsonPath)) {
            throw new Error("Input must have package.json");
        }

        const outputPackageJsonPath = path.join(outputPath, "package.json");
        if (!fs.existsSync(outputPackageJsonPath)) {
            throw new Error("Output must have package.json");
        }

        const inputContent = fs.readFileSync(inputPackageJsonPath).toString();
        const inputPackageJson = JSON.parse(inputContent);
        console.log(`Read version: [${inputPackageJsonPath}]: ${inputPackageJson.version}`);

        console.log(`Write version: [${outputPackageJsonPath}]`);
        const outputContent = fs.readFileSync(outputPackageJsonPath).toString();
        const outputPackageJson = JSON.parse(outputContent);
        let version = inputPackageJson.version;
        if (distTag === "dev") {
            const now = new Date();
            const localeDateString = now.toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
            const [month, date, year] = localeDateString.split("/");
            version = `${inputPackageJson.version}-dev.${year}${month}${date}`;
        }

        outputPackageJson.version = version;
        console.log(`target version: ${version}`);

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
        .option("dist-tag", {
            describe:
                "dev or latest, version of dist-tag will has current date information",
            type: "string",
            default: "dev"
        })
        .version()
        .alias("v", "version")
        .showHelpOnFail(true, "Specify --help for available options")
        .help("h")
        .alias("h", "help").argv;
}

main();
