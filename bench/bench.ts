import { Bench, TaskResult } from "tinybench";

export type Benchmark = {
  name: string;
  fn: () => void | Promise<void>;
  setup?: () => void | Promise<void>;
  // context?: () => T;
};

export type Result = {
  name: string;
} & Omit<TaskResult, "error" | "samples">;


export async function benchmark(benchmarks: Benchmark[]) {
  const results: Result[] = [];
  for(let i=0; i<benchmarks.length; i+=1) {
    await benchmarks[i].setup?.();
    const bench = new Bench();
    bench.add(benchmarks[i].name, benchmarks[i].fn);
    await bench.warmup();
    const [task] = await bench.run();
    if(task.result) {
      const result: Result = {
        name: task.name,
        ...(task.result ?? {})
      };
      delete (result as any).error;
      delete (result as any).samples;
      results.push(result);
    }
  }
  return results;
}
