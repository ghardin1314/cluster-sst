/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "cluster-sst",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile: "graphhive-dev",
        },
      },
    };
  },
  async run() {
    const vpc = sst.aws.Vpc.get("GhVpc", "vpc-05d1d577a4f6787b5");

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
        context: "apps/cluster",
        dockerfile: "Dockerfile",
      },
      dev: {
        autostart: true,
        command: "bun run --watch src/shard-manager.ts",
        directory: "apps/cluster",
      },
      link: [postgres],
      capacity: "spot",
    });

    const runner = new sst.aws.Service("Runner", {
      cluster,
      image: {
        context: "apps/cluster",
        dockerfile: "Dockerfile",
      },
      dev: {
        autostart: true,
        command: "bun run --watch src/runner.ts",
        directory: "apps/cluster",
      },
      link: [postgres],
    });

    const executeFn = new sst.aws.Function("ExecuteFn", {
      handler: "apps/cluster/src/execute.handler",
      link: [shardManager, postgres],
      url: true,
    });
  },
});
