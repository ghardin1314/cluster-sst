import {
  LambdaHandler,
  type APIGatewayProxyEventV2,
  type EffectHandler,
} from "@effect-aws/lambda";
import { Effect } from "effect";
import { ClusterProxyService } from "./proxy/client";

// Define your effect handler
const myEffectHandler: EffectHandler<
  APIGatewayProxyEventV2,
  ClusterProxyService,
  any,
  string
> = (event, context) =>
  Effect.gen(function* () {
    const client = yield* ClusterProxyService;
    // Your effect logic here

    const result = yield* client.Greet({
      entityId: "Test",
      payload: { name: "John" },
    });

    return result.message;
  });

// Create the Lambda handler
export const handler = LambdaHandler.make(
  myEffectHandler,
  ClusterProxyService.Default
);
