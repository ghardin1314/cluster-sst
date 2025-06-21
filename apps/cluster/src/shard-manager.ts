import { RunnerAddress } from "@effect/cluster";
import {
  NodeClusterShardManagerSocket,
  NodeRuntime,
} from "@effect/platform-node";
import { Context, Effect, Layer, Logger, LogLevel } from "effect";
import { Resource } from "sst";
import { DbLayer } from "./external/db";
import { inEcs, IpAddress, ipLayer } from "./prelude";

const program = ipLayer
  .pipe(
    Layer.flatMap((ctx) =>
      NodeClusterShardManagerSocket.layer({
        storage: "sql",
        shardingConfig: {
          shardManagerAddress: RunnerAddress.make(
            Context.get(ctx, IpAddress),
            Resource.ShardManagerPort.value
          ),
        },
      })
    )
  )
  .pipe(Layer.provide(DbLayer), Layer.launch);

const programWithLogger = inEcs
  ? program.pipe(
      Effect.provide(Logger.json),
      Effect.provide(Logger.minimumLogLevel(LogLevel.Debug))
    )
  : program;

programWithLogger.pipe(NodeRuntime.runMain({ disablePrettyLogger: inEcs }));
