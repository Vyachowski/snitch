export const checkSite = async (url: string): Promise<boolean> => {
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
