import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

import "./App.css";

const mockData = [
  {
    id: 1,
    name: "Google",
    url: "https://google.com",
    status: "online",
    lastCheck: new Date().toLocaleString("ru-RU"),
  },
  {
    id: 2,
    name: "Example Site",
    url: "https://example.com",
    status: "offline",
    lastCheck: new Date(Date.now() - 3600000).toLocaleString("ru-RU"),
  },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [sites, setSites] = useState(mockData);

  const handleAddSite = () => {
    if (siteName.trim() && siteUrl.trim()) {
      const newSite = {
        id: Date.now(),
        name: siteName,
        url: siteUrl,
        status: "online",
        lastCheck: new Date().toLocaleString("ru-RU"),
      };
      setSites([...sites, newSite]);
      setSiteName("");
      setSiteUrl("");
      setOpen(false);
    }
  };

  const handleDeleteSite = (id: number) => {
    setSites(sites.filter((site) => site.id !== id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex flex-col items-center justify-between">
            <h2 className="mb-4 text-3xl font-bold text-slate-800">
              Site Uptime Monitor
            </h2>
            <Button onClick={() => setOpen(true)} className="gap-2 w-100">
              <span className="text-lg">+</span>
              Добавить сайт
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
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          site.status === "online"
                            ? "bg-green-500 shadow-lg shadow-green-500/50"
                            : "bg-red-500 shadow-lg shadow-red-500/50"
                        }`}
                      />

                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">
                          {site.name}
                        </div>
                        <div className="text-sm text-slate-500">{site.url}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          Последняя проверка
                        </div>
                        <div className="text-sm text-slate-600">
                          {site.lastCheck}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSite(site.id)}
                      className="ml-4 hover:bg-slate-100"
                    >
                      <Trash2
                        className="h-4 w-4"
                        style={{ color: "#ef4444" }}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
