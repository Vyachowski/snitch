import { Dexie, type EntityTable } from "dexie"

/* ---------------- types ---------------- */

interface Site {
  id: string
  name: string
  url: string
  intervalMinutes: number

  lastCheckAt: number | null
  lastCheckIsUp: boolean | null
}

interface DailyStats {
  id: string
  siteId: string
  date: string
  checks: number
  up: number
  down: number
}

/* ---------------- db ---------------- */

class UptimeDatabase extends Dexie {
  sites!: EntityTable<Site, "id">
  dailyStats!: EntityTable<DailyStats, "id">

  constructor() {
    super("UptimeDatabase")

    this.version(2).stores({
      sites: "id, url, name, lastCheckAt, lastCheckIsUp",
      dailyStats: "id, siteId, date"
    })
  }

  /* ---------------- helpers ---------------- */

  private today(): string {
    return new Date().toISOString().slice(0, 10)
  }

  private makeDailyStatsId(siteId: string, date: string) {
    return `${siteId}:${date}`
  }

  /* ---------------- API ---------------- */

  async addSite(
    name: string,
    url: string,
    intervalMinutes: number
  ): Promise<Site> {
    const site: Site = {
      id: crypto.randomUUID(),
      name,
      url,
      intervalMinutes,
      lastCheckAt: null,
      lastCheckIsUp: null
    }

    await this.sites.add(site)
    return site
  }

  async getAllSites(): Promise<Site[]> {
    return this.sites.toArray()
  }

  /**
   * Обновляет:
   * 1. текущее состояние сайта
   * 2. дневную статистику
   */
  async recordCheckResult(siteId: string, isUp: boolean) {
    const date = this.today()
    const statsId = this.makeDailyStatsId(siteId, date)
    const now = Date.now()

    await this.transaction("rw", this.sites, this.dailyStats, async () => {
      /* ---- update site current state ---- */
      await this.sites.update(siteId, {
        lastCheckAt: now,
        lastCheckIsUp: isUp
      })

      /* ---- update daily stats ---- */
      const stats = await this.dailyStats.get(statsId)

      if (!stats) {
        await this.dailyStats.add({
          id: statsId,
          siteId,
          date,
          checks: 1,
          up: isUp ? 1 : 0,
          down: isUp ? 0 : 1
        })
      } else {
        await this.dailyStats.update(statsId, {
          checks: stats.checks + 1,
          up: stats.up + (isUp ? 1 : 0),
          down: stats.down + (isUp ? 0 : 1)
        })
      }
    })
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
  }
}

/* ---------------- singleton ---------------- */

const db = new UptimeDatabase()
export { db }
export type { Site, DailyStats }
