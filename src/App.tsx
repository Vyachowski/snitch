import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { db, type Site } from "@/db";

import "./App.css";

export default function App() {
  const [open, setOpen] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, boolean | undefined>>({});
  const [uptimeMap, setUptimeMap] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const loadSites = async () => {
      const allSites = await db.getAllSites();
      setSites(allSites);

      const newStatus: Record<string, boolean | undefined> = {};
      const newUptime: Record<string, number | null> = {};

      for (const s of allSites) {
        newStatus[s.id] = db.getCurrentStatus(s.id);
        newUptime[s.id] = await db.getYearlyUptime(s.id);
      }

      setStatusMap(newStatus);
      setUptimeMap(newUptime);
    };

    loadSites();
  }, []);

  const handleAddSite = async () => {
    if (!siteName.trim() || !siteUrl.trim()) return;

    const newSite = await db.addSite(siteName, siteUrl, 5);

    setSites([...sites, newSite]);
    setStatusMap({ ...statusMap, [newSite.id]: undefined });
    setUptimeMap({ ...uptimeMap, [newSite.id]: null });

    setSiteName("");
    setSiteUrl("");
    setOpen(false);
  };

  const handleDeleteSite = async (site: Site) => {
    await db.removeSite(site.id);
    setSites(sites.filter(s => s.id !== site.id));

    const newStatus = { ...statusMap };
    delete newStatus[site.id];
    setStatusMap(newStatus);

    const newUptime = { ...uptimeMap };
    delete newUptime[site.id];
    setUptimeMap(newUptime);
  };

  return (
    <div className="min-h-[90dvh] bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex flex-col items-center justify-between">
            <h2 className="mb-4 text-3xl font-bold text-slate-800">
              Site Uptime Monitor
            </h2>
            <Button onClick={() => setOpen(true)} className="gap-2 w-100">
              <span className="text-lg">+</span> Добавить сайт
            </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новый сайт</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название сайта</Label>
                  <Input
                    id="name"
                    placeholder="Например: Google"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL адрес</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddSite} className="w-full">
                  Добавить
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">
              Отслеживаемые сайты ({sites.length})
            </h3>

            {sites.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg">Нет добавленных сайтов</p>
                <p className="text-sm">
                  Нажмите "Добавить сайт" чтобы начать мониторинг
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sites.map((site) => {
                  const isUp = statusMap[site.id];
                  const uptime = uptimeMap[site.id];

                  return (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isUp === undefined
                              ? "bg-gray-300"
                              : isUp
                              ? "bg-green-500 shadow-lg shadow-green-500/50"
                              : "bg-red-500 shadow-lg shadow-red-500/50"
                          }`}
                        />

                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">
                            {site.name}
                          </div>
                          <div className="text-sm text-slate-500">{site.url}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            Аптайм: {uptime !== null ? uptime.toFixed(1) + "%" : "—"}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400">Последняя проверка</div>
                          <div className="text-sm text-slate-600">
                            {new Date().toLocaleString("ru-RU")}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSite(site)}
                        className="ml-4 hover:bg-slate-100"
                      >
                        <Trash2
                          className="h-4 w-4"
                          style={{ color: "#ef4444" }}
                        />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
