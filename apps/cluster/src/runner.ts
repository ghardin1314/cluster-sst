import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { GreeterLive } from "./entites/hello";
import { DbLayer } from "./external/db";

const RunnerLive = NodeClusterRunnerSocket.layer({
  storage: "sql",
});

const Entities = Layer.mergeAll(GreeterLive);

const program = Entities.pipe(
  Layer.provide(RunnerLive),
  Layer.provide(DbLayer),
  Layer.launch
);

program.pipe(NodeRuntime.runMain);
