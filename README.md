# Effect Cluster on SST

This repository demonstrates the simplest and most stripped-down way to deploy [Effect Cluster](https://effect-ts.github.io/effect/cluster) using [SST](https://sst.dev). It showcases how to build a distributed system with Effect's functional programming approach, deployed entirely using basic SST components without any custom configuration.

## Overview

This project implements a minimal Effect Cluster deployment that includes:

- **Shard Manager**: Central coordinator that manages cluster state and shard distribution
- **Cluster Proxy**: A private RPC server that connects you application instances to your shards
- **Runner Services**: Worker nodes that execute business logic and host entities
- **PostgreSQL Database**: Persistent storage for cluster and message state
- **Lambda Function**: HTTP endpoint that acts as a client to interact with the cluster (via the proxy)
- **AWS Infrastructure**: VPC, ECS Cluster, and managed services via SST

All infrastructure is defined in `sst.config.ts` using standard SST components - no custom or complex configuration required!

## Architecture

![image](https://github.com/user-attachments/assets/2ecb13b9-ed04-40b3-a992-24b421a5d84c)

## Getting Started

### Prerequisites

1. **Install SST** - Follow the official SST installation guide at https://sst.dev/docs/workflow/

2. **Clone this repository**
   ```bash
   git clone https://github.com/ghardin1314/cluster-sst.git
   cd cluster-sst
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

### Local Development

1. **Start the PostgreSQL database**
   ```bash
   docker compose up -d
   ```

2. **Start SST in development mode**
   ```bash
   pnpm sst dev
   ```

   SST will start the local development environment and output the Lambda function URL.

   > Note: In local development, the database and all code runs locally using `sst dev` but resembles the production deployment as closely as possible.

   > Note: This will deploy some minimal resources to your AWS account. The database and all code runs locally, but resembles a production deployment as closely as possible. Remember to remove afterwards with `pnpm sst remove`

3. **Test the cluster**
   
   Once SST finishes starting up, you'll see output including a function URL. Use curl to test the cluster:
   
   ```bash
   curl <your-function-url>
   ```

   This will execute a request through the Lambda function to the Effect Cluster, demonstrating the full flow from HTTP request → Lambda → Shard Manager → Runner → Response.

## How It Works

1. **Shard Manager** (`apps/cluster/src/shard-manager.ts`): 
   - Assigns shards to different runner instances
   - Uses PostgreSQL to persist cluster state

2. **Runner** (`apps/cluster/src/runner.ts`):
   - Worker nodes that host and execute entities
   - Connect to the Shard Manager for coordination
   - Can scale horizontally for increased capacity

3. **Entities** (`apps/cluster/src/entities/hello.ts`):
   - Business logic encapsulated as Effect entities
   - Example includes a `Greeter` entity with RPC methods
   - Supports persistence and state management
  
4. **Cluster Proxy** (`apps/cluster/src/proxy/server.ts`):
   - A private RPC server that allows application code to connect to cluster entities
   - Allows serverless functions to be more efficient when starting up since they dont need to connect to full cluster
   - No public access. Only instances in the same VPC can connect

4. **Lambda Handler** (`apps/cluster/src/execute.ts`):
   - Provides HTTP access to the cluster
   - Communicates to the cluster entities through the proxy
   - Deployed with a public URL for easy testing

## Key Features

- **Minimal Configuration**: Uses only standard SST components
- **Local Development**: Full local development support with hot reloading
- **Production Ready**: Includes VPC, managed database, and auto-scaling
- **Effect Ecosystem**: Leverages Effect's powerful capabilities
- **Minimal Typesafe Config**: Uses SST bindings to eliminate the need for special env vars.

## Deployment to AWS

To deploy to AWS:

```bash
pnpm sst deploy --stage dev
```

SST will handle all the infrastructure provisioning including:
- VPC with NAT gateway
- RDS PostgreSQL instance  
- ECS Cluster with services
- Lambda function with public URL

> Note: This does take some time to finish. Also the cluster needs a minute to spin up the containers after deployment

> Remember: remove all resources from your AWS account with `pnpm sst remove --stage dev`

## Inspired By

This repository was inspired by [sellooh/effect-cluster-via-sst](https://github.com/sellooh/effect-cluster-via-sst), but focuses on providing the absolute simplest implementation using only standard SST components.

## Learn More

- [Effect Documentation](https://effect.website)
- [SST Documentation](https://sst.dev/docs)
