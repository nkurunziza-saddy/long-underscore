import { useRef, useState } from "react";
import { toastManager } from "@/components/ui/toast";

export const useCopyToClipboard = ({
  timeout = 2000,
  title = "Copied!",
  url,
}: {
  timeout?: number;
  title?: string;
  url: string;
}) => {
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!navigator?.clipboard) {
      toastManager.add({
        type: "error",
        title: "Error",
        description: "Clipboard not supported",
        positionerProps: {
          anchor: copyButtonRef.current,
          side: "top",
          sideOffset: 8,
        },
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);

      if (copyButtonRef.current) {
        toastManager.add({
          title,
          timeout,
          positionerProps: {
            anchor: copyButtonRef.current,
            sideOffset: 8,
          },
        });
      }

      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      toastManager.add({
        type: "error",
        title: "Failed",
        description: "Could not copy text",
        positionerProps: {
          anchor: copyButtonRef.current,
          side: "top",
          sideOffset: 8,
        },
      });
      setIsCopied(false);
    }
  };

  return {
    copyButtonRef,
    copyToClipboard,
    isCopied,
  };
};
