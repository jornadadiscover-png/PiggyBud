import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, RefreshCw } from "lucide-react";

type Status = "idle" | "cleaning" | "done" | "error";

async function cleanCachesAndSW(): Promise<string[]> {
  const log: string[] = [];
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      log.push(`Service Workers encontrados: ${regs.length}`);
      await Promise.all(
        regs.map(async (r) => {
          try {
            await r.unregister();
            log.push(`Removido: ${r.scope}`);
          } catch (e) {
            log.push(`Falha ao remover ${r.scope}`);
          }
        }),
      );
    }
  } catch (e) {
    log.push("Erro ao listar Service Workers");
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      log.push(`Caches encontrados: ${keys.length}`);
      await Promise.all(
        keys.map(async (k) => {
          try {
            await caches.delete(k);
            log.push(`Cache apagado: ${k}`);
          } catch (e) {
            log.push(`Falha ao apagar cache: ${k}`);
          }
        }),
      );
    }
  } catch (e) {
    log.push("Erro ao limpar caches");
  }
  return log;
}

export default function ResetPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [clearLocal, setClearLocal] = useState(false);

  const run = async (alsoLocal: boolean) => {
    setStatus("cleaning");
    setLogs([]);
    try {
      const log = await cleanCachesAndSW();
      if (alsoLocal) {
        try {
          localStorage.clear();
          sessionStorage.clear();
          log.push("LocalStorage e SessionStorage limpos");
        } catch {
          log.push("Falha ao limpar storage local");
        }
      }
      setLogs(log);
      setStatus("done");
      setTimeout(() => {
        const url = new URL(window.location.origin);
        url.searchParams.set("_v", Date.now().toString());
        window.location.replace(url.toString());
      }, 1500);
    } catch {
      setStatus("error");
    }
  };

  // Auto-run cleanup (without wiping localStorage) on first mount
  useEffect(() => {
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-0 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {status === "cleaning" && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            {status === "done" && <CheckCircle2 className="w-6 h-6 text-primary" />}
            {status === "idle" && <RefreshCw className="w-6 h-6 text-primary" />}
            <h1 className="text-xl font-bold">Atualizando o Piggy Bud</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {status === "cleaning" && "Limpando versões antigas em cache..."}
            {status === "done" && "Pronto! Abrindo a versão mais nova..."}
            {status === "idle" && "Preparando..."}
            {status === "error" && "Algo deu errado. Tente novamente."}
          </p>

          <div className="rounded-xl border p-3 bg-muted/30 text-xs font-mono max-h-48 overflow-auto">
            {logs.length === 0 ? (
              <span className="text-muted-foreground">Sem registros ainda...</span>
            ) : (
              logs.map((l, i) => <div key={i}>• {l}</div>)
            )}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium">
              Ainda vendo PIN antigo ou dados de bancos antigos?
            </p>
            <div className="flex items-start gap-2">
              <Checkbox
                id="clear-local"
                checked={clearLocal}
                onCheckedChange={(c) => setClearLocal(c === true)}
              />
              <Label htmlFor="clear-local" className="text-xs leading-snug">
                Também limpar dados locais (apaga PIN, transações antigas e
                configurações deste dispositivo). Use só se necessário.
              </Label>
            </div>
            <Button
              onClick={() => run(clearLocal)}
              disabled={status === "cleaning"}
              className="w-full rounded-xl"
              variant={clearLocal ? "destructive" : "default"}
            >
              {clearLocal ? "Limpar tudo e recarregar" : "Rodar limpeza novamente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
