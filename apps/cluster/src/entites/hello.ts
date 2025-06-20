import { ClusterSchema, Entity } from "@effect/cluster";
import { Rpc } from "@effect/rpc";
import { Effect, Schema } from "effect";

export const Greeter = Entity.make("Greeter", [
  Rpc.make("Greet", {
    payload: {
      name: Schema.String,
    },
    success: Schema.Struct({
      message: Schema.String,
    }),
  }),
]).annotateRpcs(ClusterSchema.Persisted, true);

export const GreeterLive = Greeter.toLayer(
  Effect.gen(function* () {
    const address = yield* Entity.CurrentAddress;

    return {
      Greet: Effect.fn(function* (args) {
        yield* Effect.log(
          `Greeting ${args.payload.name} from ${address.entityId} ${address.entityType} ${address.shardId}`
        );
        return {
          message: `Hello, ${args.payload.name}! from ${address.entityId} ${address.entityType} ${address.shardId}`,
        };
      }),
    };
  })
);
