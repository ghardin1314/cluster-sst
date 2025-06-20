/// <reference path="./.sst/platform/config.d.ts" />

import type { ServiceArgs } from ".sst/platform/src/components/aws";

export default $config({
  app(input) {
    return {
      name: "cluster-sst",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("EClustVpc", {
      nat: "ec2",
    });

    const postgres = new sst.aws.Postgres("EClustPostgres", {
      vpc,
      dev: {
        username: "postgres",
        password: "postgres",
        database: "postgres",
        port: 5435,
      },
      version: "16.8",
    });

    const cluster = new sst.aws.Cluster("EClustCluster", {
      vpc,
    });

    const shardManager = new sst.aws.Service("ShardManager", {
      cluster,
      image: {
        context: ".",
        dockerfile: "apps/cluster/Dockerfile",
      },
      environment: {
        LOG_LEVEL: "DEBUG",
      },
      command: $dev
        ? undefined
        : ["bun", "run", "apps/cluster/src/shard-manager.ts"],
      dev: {
        autostart: true,
        command: "bun run --watch src/shard-manager.ts",
        directory: "apps/cluster",
      },
      link: [postgres],
      capacity: "spot",
    });

    const SHARD_MANAGER_HOST = $dev ? "localhost" : shardManager.service;
    const SHARD_MANAGER_PORT = 8080;
     const ShardConfig = new sst.Linkable("ShardConfig", {
      properties: {
        SHARD_MANAGER_HOST,
        SHARD_MANAGER_PORT,
      },
    });

    const runnerContainer = ({
      index,
      port,
    }: {
      index: number;
      port: number;
    }) => {
      return {
        memory: "0.25 GB",
        name: `shard-runner-${index}`,
        image: {
          context: ".",
          dockerfile: "apps/cluster/Dockerfile",
        },
        // health: ... // Check https://github.com/sellooh/effect-cluster-via-sst for how to add a healthcheck endpoint
        environment: {
          PORT: port.toString(),
          LOG_LEVEL: "DEBUG",
        },
        command: $dev
          ? undefined
          : ["bun", "run", "apps/cluster/src/runner.ts"],
        dev: {
          autostart: true,
          command: "bun run --watch src/runner.ts",
          directory: "apps/cluster",
        },
      } satisfies NonNullable<ServiceArgs["containers"]>[number];
    };

    const runner = new sst.aws.Service("Runner", {
      capacity: "spot", // For production, probably dont use only spot. Can use normal or a mixture
      memory: "1 GB",
      cluster,
      // scaling: ... // For production, can set auto scaling based on CPU/memory usage
      containers: [
        runnerContainer({ index: 0, port: 34431 }),
        runnerContainer({ index: 1, port: 34432 }),
        runnerContainer({ index: 2, port: 34433 }),
        runnerContainer({ index: 3, port: 34434 }),
      ],
      link: [postgres, shardManager, ShardConfig],
    });

    const executeFn = new sst.aws.Function("ExecuteFn", {
      vpc,
      handler: "apps/cluster/src/execute.handler",
      link: [shardManager, postgres, ShardConfig],
      url: true,
      environment: {
        LOG_LEVEL: "DEBUG",
      },
    });
  },
});
