import {Model} from "@automatons/parser";
import {VariableDeclarationKind} from "ts-morph";
import {render} from "./render";
import {schemaToZod} from "./zod";

/**
 * Emit a single model file: a `z` import, imports for referenced model schemas,
 * the exported `XxxSchema` zod schema and an inferred `type Xxx`.
 */
export const emitModel = (model: Model): string =>
  render((sf) => {
    sf.addImportDeclaration({namedImports: ["z"], moduleSpecifier: "zod"});
    model.imports.forEach((imported) =>
      sf.addImportDeclaration({
        namedImports: [`${imported.title}Schema`],
        moduleSpecifier: `./${imported.filename}`,
      }),
    );
    sf.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{name: `${model.title}Schema`, initializer: schemaToZod(model.schema)}],
    });
    sf.addTypeAlias({
      isExported: true,
      name: model.title,
      type: `z.infer<typeof ${model.title}Schema>`,
    });
  });

/**
 * Emit models/index.ts re-exporting every model.
 */
export const emitModelsIndex = (models: Model[]): string =>
  render((sf) =>
    models.forEach((model) => sf.addExportDeclaration({moduleSpecifier: `./${model.filename}`})),
  );

/**
 * Emit the top-level index.ts.
 */
export const emitIndex = (hasModels: boolean): string =>
  render((sf) => {
    if (hasModels) sf.addExportDeclaration({moduleSpecifier: "./models"});
  });
