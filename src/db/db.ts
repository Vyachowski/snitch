import { Dexie, type EntityTable } from "dexie"

interface Site {
  id: string
  url: string
  intervalMinutes: number
}

interface DailyStats {
  id: string // `${siteId}:${date}`
  siteId: string
  date: string
  checks: number
  up: number
  down: number
  totalResponseTime: number
}

const db = new Dexie("UptimeDatabase") as Dexie & {
  sites: EntityTable<Site, 'id'>
  dailyStats: EntityTable<DailyStats, 'id'>
}

db.version(1).stores({
  sites: 'id, url',
  dailyStats: 'id, siteId, date'
})

export type { Site, DailyStats }
export { db }
