// conenction to Database
import { Redis } from '@upstash/redis'

export const db = Redis.fromEnv()
