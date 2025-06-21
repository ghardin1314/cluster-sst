import { EntityProxyServer, RunnerAddress } from "@effect/cluster";
import {
  NodeClusterRunnerSocket,
  NodeRuntime,
  NodeSocketServer,
} from "@effect/platform-node";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Context, Effect, Layer, Logger, LogLevel } from "effect";
import { Resource } from "sst";
import { Greeter } from "../entites/hello";
import { DbLayer } from "../external/db";
import { inEcs, IpAddress, ipLayer } from "../prelude";
import { ProxyRpc } from "./rpc";

const GreeterRpcLive = EntityProxyServer.layerRpcHandlers(Greeter);

const ProxyRpcServer = RpcServer.layer(ProxyRpc).pipe(
  Layer.provide(GreeterRpcLive)
  // Layer.provide(OtherRpcLive)
);

const ClusterClientLayer = NodeClusterRunnerSocket.layer({
  clientOnly: true,
  storage: "sql",
  shardingConfig: {
    shardManagerAddress: RunnerAddress.make(
      Resource.ShardManagerHost.value,
      Resource.ShardManagerPort.value
    ),
  },
}).pipe(Layer.provide(DbLayer));

const proxySocketServer = ipLayer.pipe(
  Layer.flatMap((ctx) =>
    NodeSocketServer.layer({
      host: Context.get(ctx, IpAddress),
      port: Resource.ProxyPort.value,
    })
  )
);

const program = ProxyRpcServer.pipe(
  Layer.provide(ClusterClientLayer),
  Layer.provide(RpcServer.layerProtocolSocketServer),
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(proxySocketServer),
  Layer.launch
);

const programWithLogger = inEcs
  ? program.pipe(
      Effect.provide(Logger.json),
      Effect.provide(Logger.minimumLogLevel(LogLevel.Debug))
    )
  : program;

programWithLogger.pipe(NodeRuntime.runMain({ disablePrettyLogger: inEcs }));
