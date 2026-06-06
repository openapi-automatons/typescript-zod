import {AutomatonSettings, Openapi} from "@automatons/tools";
import {parser} from "@automatons/parser";
import {write} from "./render";
import {emitIndex, emitModel, emitModelsIndex} from "./model";

export const generate = async (openapi: Openapi, settings: AutomatonSettings): Promise<void[]> => {
  const {outDir} = settings;
  const {models} = await parser(openapi, settings);
  const tasks: Promise<void>[] = [];

  if (models.length) {
    tasks.push(write(outDir, "models/index.ts", emitModelsIndex(models)));
    models.forEach((model) => tasks.push(write(outDir, `models/${model.filename}.ts`, emitModel(model))));
  }

  tasks.push(write(outDir, "index.ts", emitIndex(models.length > 0)));

  return Promise.all(tasks);
};
