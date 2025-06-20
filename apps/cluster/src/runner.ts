import { RunnerAddress } from "@effect/cluster";
import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { Context, Effect, Layer, Logger, LogLevel, Option } from "effect";
import { Resource } from "sst";
import { GreeterLive } from "./entites/hello";
import { DbLayer } from "./external/db";
import { inEcs, IpAddress, ipLayer, Port, portLayer } from "./prelude";

const RunnerLive = Layer.merge(ipLayer, portLayer).pipe(
  Layer.flatMap((ctx) =>
    NodeClusterRunnerSocket.layer({
      storage: "sql",
      shardingConfig: {
        runnerAddress: Option.some(
          RunnerAddress.make(
            Context.get(ctx, IpAddress),
            Context.get(ctx, Port)
          )
        ),
        shardManagerAddress: RunnerAddress.make(
          Resource.ShardManager.service,
          8080
        ),
      },
    })
  )
);

const Entities = Layer.mergeAll(GreeterLive);

const program = Entities.pipe(
  Layer.provide(RunnerLive),
  Layer.provide(DbLayer),
  Layer.launch
);

const programWithLogger = inEcs
  ? program.pipe(
      Effect.provide(Logger.json),
      Effect.provide(Logger.minimumLogLevel(LogLevel.Debug))
    )
  : program;

programWithLogger.pipe(NodeRuntime.runMain({ disablePrettyLogger: inEcs }));
