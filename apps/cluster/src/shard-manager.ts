import {
  NodeClusterShardManagerSocket,
  NodeRuntime,
} from "@effect/platform-node";
import { Layer } from "effect";
import { DbLayer } from "./external/db";

const program = NodeClusterShardManagerSocket.layer({ storage: "sql" }).pipe(
  Layer.provide(DbLayer),
  Layer.launch
);

program.pipe(NodeRuntime.runMain);
