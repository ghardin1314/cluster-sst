/// <reference path="./.sst/platform/config.d.ts" />

function privateDnsName() {
  return `${$app.stage}.effect-cluster.private`;
}
function generateServiceHostname(serviceName: string) {
  return `${serviceName}.${$app.name}.${privateDnsName()}`;
}

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
    const vpc = $dev
      ? sst.aws.Vpc.get("EClustVpc", "vpc-05d1d577a4f6787b5")
      : new sst.aws.Vpc("EClustVpc", {
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
        // SHARD_MANAGER_HOST,
        LOG_LEVEL: "DEBUG",
      },
      command: $dev
        ? undefined
        : ["bun", "run", "apps/cluster/src/shard-manager.ts"],
      dev: {
        autostart: true,
        command: "bun run --hot src/shard-manager.ts",
        directory: "apps/cluster",
      },
      link: [postgres],
      capacity: "spot",
    });

    const SHARD_MANAGER_HOST = $dev
      ? "localhost"
      : // : generateServiceHostname("ShardManager");
        shardManager.service;

    const runner = new sst.aws.Service("Runner", {
      cluster,
      image: {
        context: ".",
        dockerfile: "apps/cluster/Dockerfile",
      },
      environment: {
        SHARD_MANAGER_HOST,
        PORT: "34431",
        LOG_LEVEL: "DEBUG",
      },
      command: $dev ? undefined : ["bun", "run", "apps/cluster/src/runner.ts"],
      dev: {
        autostart: true,
        command: "bun run --hot src/runner.ts",
        directory: "apps/cluster",
      },
      link: [postgres],
    });

    const executeFn = new sst.aws.Function("ExecuteFn", {
      vpc,
      handler: "apps/cluster/src/execute.handler",
      link: [shardManager, postgres],
      url: true,
      environment: {
        SHARD_MANAGER_HOST,
        LOG_LEVEL: "DEBUG",
      },
    });
  },
});
