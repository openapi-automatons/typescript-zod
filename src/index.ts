import {Automaton} from "@automatons/tools";
import {generate} from "./generator";

const generatorTypescriptZod: Automaton = (openapi, settings) =>
  generate(openapi, settings);

export default generatorTypescriptZod;
