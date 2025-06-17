import { PgClient } from "@effect/sql-pg"
import { Config, Redacted } from "effect"
import { constVoid } from "effect/Function"
import { Resource } from "sst"

// TODO: Replace with Resource
export const DbLayer = PgClient.layer({
  database: Resource.EClustPostgres.database,
  username: Resource.EClustPostgres.username,
  password: Redacted.make(Resource.EClustPostgres.password),
  host: Resource.EClustPostgres.host,
  port: Resource.EClustPostgres.port,
  onnotice: constVoid,
})
