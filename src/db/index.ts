import { Dexie, type EntityTable } from "dexie"

interface Site {
  id: string
  url: string
  intervalMinutes: number
}

interface DailyStats {
  id: string // `${siteId}:${date}`
  siteId: string
  date: string // YYYY-MM-DD
  checks: number
  up: number
  down: number
}

const db = new Dexie("UptimeDatabase") as Dexie & {
  sites: EntityTable<Site, "id">
  dailyStats: EntityTable<DailyStats, "id">
}

db.version(1).stores({
  sites: "id, url",
  dailyStats: "id, siteId, date"
})

/* ---------------- helpers ---------------- */

const today = (): string =>
  new Date().toISOString().slice(0, 10)

const daysAgo = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

const makeDailyStatsId = (siteId: string, date: string) =>
  `${siteId}:${date}`

/* ---------------- API ---------------- */

const addSite = async (
  url: string,
  intervalMinutes: number = 1
): Promise<Site> => {
  const site: Site = {
    id: crypto.randomUUID(),
    url,
    intervalMinutes
  }

  await db.sites.add(site)
  return site
}

const getAllSites = async (): Promise<Site[]> => {
  return db.sites.toArray()
}

const updateSiteDailyStats = async (
  siteId: string,
  isUp: boolean
): Promise<void> => {
  const date = today()
  const id = makeDailyStatsId(siteId, date)

  await db.transaction("rw", db.dailyStats, async () => {
    const stats = await db.dailyStats.get(id)

    if (!stats) {
      await db.dailyStats.add({
        id,
        siteId,
        date,
        checks: 1,
        up: isUp ? 1 : 0,
        down: isUp ? 0 : 1
      })
    } else {
      await db.dailyStats.update(id, {
        checks: stats.checks + 1,
        up: stats.up + (isUp ? 1 : 0),
        down: stats.down + (isUp ? 0 : 1)
      })
    }
  })
}

/**
 * Годовой аптайм за последние 365 дней
 */
const getYearlyUptime = async (
  siteId: string
): Promise<number | null> => {
  const fromDate = daysAgo(365)

  const stats = await db.dailyStats
    .where("siteId")
    .equals(siteId)
    .and(row => row.date >= fromDate)
    .toArray()

  if (stats.length === 0) return null

  const totalChecks = stats.reduce(
    (sum, d) => sum + d.checks,
    0
  )

  if (totalChecks === 0) return null

  const upChecks = stats.reduce(
    (sum, d) => sum + d.up,
    0
  )

  return (upChecks / totalChecks) * 100
}

/**
 * Удаляет сайт и ВСЮ его статистику
 */
const removeSite = async (siteId: string): Promise<void> => {
  await db.transaction("rw", db.sites, db.dailyStats, async () => {
    await db.sites.delete(siteId)
    await db.dailyStats
      .where("siteId")
      .equals(siteId)
      .delete()
  })
}

export type { Site, DailyStats }
export {
  addSite,
  getAllSites,
  updateSiteDailyStats,
  getYearlyUptime,
  removeSite
}
