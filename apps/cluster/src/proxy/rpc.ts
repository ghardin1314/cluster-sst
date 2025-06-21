import { EntityProxy } from "@effect/cluster";
import { Greeter } from "../entites/hello";

export class GreeterRpc extends EntityProxy.toRpcGroup(Greeter) {}

export const ProxyRpc = GreeterRpc; // .merge(OtherRpc)
