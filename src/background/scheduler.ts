export const CHECK_ALARM = "uptime-check"

export const scheduleGlobalAlarm = () => {
  chrome.alarms.create(CHECK_ALARM, {
    periodInMinutes: 1
  })
}
