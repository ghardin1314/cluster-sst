import { NodeSocket } from "@effect/platform-node";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer } from "effect";
import { Resource } from "sst";
import { ProxyRpc } from "./rpc";

const RpcClientLayer = RpcClient.layerProtocolSocket().pipe(
  Layer.provide(
    NodeSocket.layerNet({
      host: Resource.ProxyHost.value,
      port: Resource.ProxyPort.value,
    })
  ),
  Layer.provide(RpcSerialization.layerNdjson)
);

export class ClusterProxyService extends Effect.Service<ClusterProxyService>()(
  "ClusterProxyService",
  {
    scoped: RpcClient.make(ProxyRpc),
    dependencies: [RpcClientLayer],
  }
) {}
