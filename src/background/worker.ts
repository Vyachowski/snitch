import { db } from "@/db"
import { checkSite } from "./checker"
import {
  CHECK_ALARM,
  scheduleGlobalAlarm
} from "./scheduler"

/**
 * В памяти воркера:
 * siteId -> timestamp последней проверки
 */
const lastCheckMap = new Map<string, number>()

/* -------- lifecycle -------- */

chrome.runtime.onInstalled.addListener(() => {
  scheduleGlobalAlarm()
})

chrome.runtime.onStartup?.addListener(() => {
  scheduleGlobalAlarm()
})

/* -------- alarms -------- */

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== CHECK_ALARM) return
  await runChecks()
})

/* -------- messages from UI -------- */

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "RUN_CHECK_NOW") {
    runChecks(true).then(() => sendResponse({ ok: true }))
    return true
  }
})

/* -------- core logic -------- */

const runChecks = async (force = false) => {
  const sites = await db.getAllSites()
  const now = Date.now()

  for (const site of sites) {
    const last = lastCheckMap.get(site.id) ?? 0
    const intervalMs = site.intervalMinutes * 60_000

    if (!force && now - last < intervalMs) continue

    const isUp = await checkSite(site.url)
    await db.updateSiteDailyStats(site.id, isUp)

    lastCheckMap.set(site.id, now)
  }
}
