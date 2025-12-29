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

class UptimeDatabase extends Dexie {
  sites!: EntityTable<Site, "id">
  dailyStats!: EntityTable<DailyStats, "id">

  private lastCheckMap = new Map<string, boolean>() // siteId -> last isUp

  constructor() {
    super("UptimeDatabase")
    this.version(1).stores({
      sites: "id, url",
      dailyStats: "id, siteId, date"
    })
  }

  /* ---------------- API ---------------- */

  private today(): string {
    return new Date().toISOString().slice(0, 10)
  }

  private makeDailyStatsId(siteId: string, date: string) {
    return `${siteId}:${date}`
  }

  async addSite(url: string, intervalMinutes: number): Promise<Site> {
    const site: Site = { id: crypto.randomUUID(), url, intervalMinutes }
    await this.sites.add(site)
    return site
  }

  async getAllSites(): Promise<Site[]> {
    return this.sites.toArray()
  }

  async updateSiteDailyStats(siteId: string, isUp: boolean) {
    const date = this.today()
    const id = this.makeDailyStatsId(siteId, date)

    await this.transaction("rw", this.dailyStats, async () => {
      const stats = await this.dailyStats.get(id)
      if (!stats) {
        await this.dailyStats.add({
          id,
          siteId,
          date,
          checks: 1,
          up: isUp ? 1 : 0,
          down: isUp ? 0 : 1
        })
      } else {
        await this.dailyStats.update(id, {
          checks: stats.checks + 1,
          up: stats.up + (isUp ? 1 : 0),
          down: stats.down + (isUp ? 0 : 1)
        })
      }
    })

    this.lastCheckMap.set(siteId, isUp)
  }

  async getYearlyUptime(siteId: string): Promise<number | null> {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 365)
    const fromDateStr = fromDate.toISOString().slice(0, 10)

    const stats = await this.dailyStats
      .where("siteId")
      .equals(siteId)
      .and(row => row.date >= fromDateStr)
      .toArray()

    if (!stats.length) return null

    const totalChecks = stats.reduce((sum, s) => sum + s.checks, 0)
    if (totalChecks === 0) return null

    const upChecks = stats.reduce((sum, s) => sum + s.up, 0)
    return (upChecks / totalChecks) * 100
  }

  async removeSite(siteId: string) {
    await this.transaction("rw", this.sites, this.dailyStats, async () => {
      await this.sites.delete(siteId)
      await this.dailyStats.where("siteId").equals(siteId).delete()
    })
    this.lastCheckMap.delete(siteId)
  }

  getCurrentStatus(siteId: string): boolean | undefined {
    return this.lastCheckMap.get(siteId)
  }
}

/* ---------------- экспорт синглтона ---------------- */
const db = new UptimeDatabase()
export { db }
export type { Site, DailyStats }
