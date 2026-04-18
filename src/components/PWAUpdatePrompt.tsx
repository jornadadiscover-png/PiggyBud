import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast("Nova versão disponível!", {
        description: "Atualize para ver as últimas novidades do Piggy Bud.",
        duration: Infinity,
        action: {
          label: "Atualizar",
          onClick: () => updateServiceWorker(true),
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
};

export default PWAUpdatePrompt;
