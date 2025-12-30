import { db } from "@/db"

/* ---------------- checker ---------------- */

const checkSite = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal
    })

    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

/* ---------------- scheduler ---------------- */

const CHECK_ALARM = "uptime-check"

const scheduleGlobalAlarm = () => {
  chrome.alarms.create(CHECK_ALARM, {
    periodInMinutes: 1
  })
}

/* ---------------- lifecycle ---------------- */

chrome.runtime.onInstalled.addListener(() => {
  scheduleGlobalAlarm()
})

chrome.runtime.onStartup?.addListener(() => {
  scheduleGlobalAlarm()
})

/* ---------------- alarms ---------------- */

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== CHECK_ALARM) return
  await runChecks()
})

/* ---------------- messages from UI ---------------- */

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "RUN_CHECK_NOW") {
    runChecks(true).then(() => sendResponse({ ok: true }))
    return true
  }
})

/* ---------------- core logic ---------------- */

const runChecks = async (force = false) => {
  const sites = await db.getAllSites()
  const now = Date.now()

  for (const site of sites) {
    const intervalMs = site.intervalMinutes * 60_000

    const lastCheckAt = site.lastCheckAt ?? 0
    const shouldRun =
      force || now - lastCheckAt >= intervalMs

    if (!shouldRun) continue

    const isUp = await checkSite(site.url)

    await db.recordCheckResult(site.id, isUp)
  }
}
