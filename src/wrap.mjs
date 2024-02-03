import ts from "typescript";

function isDef(v) {
    return v !== undefined && v !== null;
}

export function wrapDtsIntoDeclareModule(filename, content, moduleName) {
    const sourceFile = ts.createSourceFile(
        filename,
        content,
        ts.ScriptTarget.Latest
    );
    const filterOutDeclarationKeyword = modifier =>
        modifier.kind !== ts.SyntaxKind.DeclareKeyword;

    const stmts = sourceFile.statements
        .map(stmt => {
            if (
                ts.isModuleDeclaration(stmt) &&
                stmt.flags & ts.NodeFlags.Namespace
            ) {
                return ts.factory.updateModuleDeclaration(
                    stmt,
                    stmt.modifiers?.filter(filterOutDeclarationKeyword),
                    stmt.name,
                    stmt.body
                );
            } else if (ts.isFunctionDeclaration(stmt)) {
                return ts.factory.updateFunctionDeclaration(
                    stmt,
                    stmt.modifiers?.filter(filterOutDeclarationKeyword),
                    stmt.asteriskToken,
                    stmt.name,
                    stmt.typeParameters,
                    stmt.parameters,
                    stmt.type,
                    stmt.body
                );
            } else if (ts.isNamespaceExportDeclaration(stmt)) {
                return undefined;
            } else if (ts.isVariableStatement(stmt)) {
                return ts.factory.updateVariableStatement(
                    stmt,
                    stmt.modifiers?.filter(filterOutDeclarationKeyword),
                    stmt.declarationList
                );
            }
            return stmt;
        })
        .filter(isDef);

    const newSourceFile = ts.factory.createSourceFile(
        [
            ts.factory.createModuleDeclaration(
                [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
                ts.factory.createStringLiteral(moduleName),
                ts.factory.createModuleBlock(stmts),
                sourceFile.flags
            )
        ],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    const printer = ts.createPrinter();
    return printer.printFile(newSourceFile);
}
