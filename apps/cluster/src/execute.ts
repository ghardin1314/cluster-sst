import {
  LambdaHandler,
  type APIGatewayProxyEventV2,
  type EffectHandler,
} from "@effect-aws/lambda";
import { RunnerAddress, type Sharding } from "@effect/cluster";
import { NodeClusterRunnerSocket } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { Resource } from "sst";
import { Greeter } from "./entites/hello";
import { DbLayer } from "./external/db";

const LambdaClusterLayer = NodeClusterRunnerSocket.layer({
  clientOnly: true,
  storage: "sql",
  shardingConfig: {
    shardManagerAddress: RunnerAddress.make(
      Resource.ShardConfig.SHARD_MANAGER_HOST,
      Resource.ShardConfig.SHARD_MANAGER_PORT
    ),
  },
}).pipe(Layer.provide(DbLayer));

// Define your effect handler
const myEffectHandler: EffectHandler<
  APIGatewayProxyEventV2,
  Sharding.Sharding,
  any,
  string
> = (event, context) =>
  Effect.gen(function* () {
    const client = yield* Greeter.client;
    // Your effect logic here

    const result = yield* client("Test").Greet({ name: "John" });
    return result.message;
  });

// Create the Lambda handler
export const handler = LambdaHandler.make(myEffectHandler, LambdaClusterLayer);
