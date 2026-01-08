import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { db, type Site } from "@/db"

import "./App.css"
import { DialogDescription } from "@radix-ui/react-dialog"

/* ---------------- helpers ---------------- */

const formatDateTime = (ts: number | null) => {
  if (!ts) return "—"
  return new Date(ts).toLocaleString("ru-RU")
}

const statusDotClass = (isUp: boolean | null) => {
  if (isUp === undefined) return "bg-gray-300"
  if (isUp) return "bg-green-500 shadow-lg shadow-green-500/50"
  return "bg-red-500 shadow-lg shadow-red-500/50"
}

/* ---------------- component ---------------- */

export default function App() {
  const [open, setOpen] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const sites = useLiveQuery(() => db.sites.toArray(), [], [] as Site[])
  const uptimeMap = useLiveQuery<Record<string, number | null>>(
    async () => {
      const result: Record<string, number | null> = {}
      for (const site of sites) {
        result[site.id] = await db.getYearlyUptime(site.id)
      }
      return result
    },
    [sites]
  )

  const handleAddSite = async () => {
    if (!siteName.trim() || !siteUrl.trim()) return

    setIsAdding(true)

    try {
      const newSite = await db.addSite(siteName, siteUrl, 5)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      let isUp = false
      try {
        const res = await fetch(siteUrl, { method: "GET", signal: controller.signal })
        isUp = res.ok
      } catch {
        isUp = false
      } finally {
        clearTimeout(timeout)
      }

      await db.recordCheckResult(newSite.id, isUp)
      setSiteName("")
      setSiteUrl("")
      setOpen(false)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteSite = async (site: Site) => {
    await db.removeSite(site.id)
  }

  /* ---------------- render ---------------- */

  return (
    <div className="min-h-[90dvh] bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex flex-col items-center justify-between">
            <h2 className="mb-4 text-3xl font-bold text-slate-800">
              Site Uptime Monitor
            </h2>
            <Button onClick={() => setOpen(true)} className="gap-2 w-100">
              <span className="text-lg">+</span> Add site
            </Button>
          </div>

          {/* -------- dialog -------- */}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent >
              <DialogHeader>
                <DialogTitle>Add new site</DialogTitle>
                <DialogDescription className="invisible">Form for adding site to monitoring</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Site name</Label>
                  <Input
                    id="name"
                    placeholder="Example: Google"
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={siteUrl}
                    onChange={e => setSiteUrl(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleAddSite}
                  className="w-full"
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* -------- list -------- */}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">
              Tracked websites ({sites.length})
            </h3>

            {sites.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg">No added sites</p>
                <p className="text-sm">
                  Press "Add site" to start monitoring
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sites.map(site => {
                  const uptime = uptimeMap?.[site.id]

                  return (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${statusDotClass(
                            site.lastCheckIsUp
                          )}`}
                        />

                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">
                            {site.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {site.url}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Uptime:{" "}
                            {typeof uptime === "number"
                              ? `${uptime.toFixed(1)}%`
                              : "—"}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400">
                            Last check
                          </div>
                          <div className="text-sm text-slate-600">
                            {formatDateTime(site.lastCheckAt)}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSite(site)}
                        className="ml-4 hover:bg-slate-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
