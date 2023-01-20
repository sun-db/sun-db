import { Result } from "./bench.js";

function formatName(name: string) {
  return name.padEnd(20, " ");
}

function formatResult(result: Result) {
  const ops = parseInt(result.hz.toFixed(0)).toLocaleString();
  return `${ops} ops/sec`.padStart(20, " ");
}

export function output(results: Result[]) {
  results.forEach((result) => {
    console.info(`${formatName(result.name)} ${formatResult(result)}`);
  });
}
