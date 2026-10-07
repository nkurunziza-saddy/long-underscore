"use client";

import { Toast } from "@base-ui/react/toast";
import {
  CheckCircleIcon,
  CircleNotchIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const toastManager = Toast.createToastManager();

/** The mark of each outcome. Colour never says it alone: the title does. */
const MARKS = {
  success: { Icon: CheckCircleIcon, tone: "text-success" },
  error: { Icon: XCircleIcon, tone: "text-destructive" },
} as const;

/**
 * What a toast says: its mark, as tall as the title's first line, then the
 * title over what to do about it.
 */
function ToastBody({ type }: { type: string | undefined }) {
  const mark = type === "success" || type === "error" ? MARKS[type] : null;
  return (
    <>
      {mark && (
        <mark.Icon
          aria-hidden
          weight="fill"
          className={cn("h-lh w-4 shrink-0", mark.tone)}
        />
      )}
      {type === "loading" && (
        <CircleNotchIcon
          aria-hidden
          className="h-lh w-4 shrink-0 animate-spin text-fg-3"
        />
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <Toast.Title data-slot="toast-title" className="font-medium" />
        <Toast.Description
          data-slot="toast-description"
          className="text-xs text-pretty text-fg-2"
        />
      </div>
    </>
  );
}

/**
 * The stack in the bottom right corner: the newest in front, the ones behind
 * it peeking out above, all of them spread out while the pointer or the
 * keyboard is on them.
 */
function Toasts() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal data-slot="toast-portal">
      <Toast.Viewport
        data-slot="toast-viewport"
        className="fixed right-(--toast-inset) bottom-(--toast-inset) z-60 flex w-[calc(100%-var(--toast-inset)*2)] max-w-90 [--toast-inset:--spacing(4)] sm:[--toast-inset:--spacing(6)]"
      >
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            data-slot="toast"
            swipeDirection={["right", "down"]}
            className={cn(
              "absolute right-0 bottom-0 z-[calc(9999-var(--toast-index))] h-(--toast-calc-height) w-full origin-bottom rounded-menu bg-popover text-popover-foreground shadow-pop select-none [transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s]",
              // The gap between two toasts belongs to the stack, so
              // crossing it does not fold the stack back up.
              "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full",
              "[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))] [--toast-gap:--spacing(3)] [--toast-peek:--spacing(3)] [--toast-scale:calc(max(0,1-(var(--toast-index)*.1)))] [--toast-shrink:calc(1-var(--toast-scale))]",
              "[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--toast-gap)*-1+var(--toast-swipe-movement-y))]",
              // Stacked: each one behind is smaller and a step higher.
              "transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
              // Spread out: full size, one above the other.
              "data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]",
              // Past the limit, one waits out of sight.
              "data-limited:opacity-0",
              // In from below; out the same way, or the way it was swiped.
              "data-starting-style:not-data-ending-style:transform-[translateY(calc(100%+var(--toast-inset)))]",
              "data-ending-style:opacity-0",
              "data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]",
              "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
              "data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
            )}
          >
            <Toast.Content
              data-slot="toast-content"
              // Behind the front one a toast is an empty card, until the
              // stack is spread out.
              className="flex gap-2.5 overflow-hidden px-3.5 py-3 text-sm transition-opacity duration-250 data-behind:not-data-expanded:pointer-events-none data-behind:not-data-expanded:opacity-0"
            >
              <ToastBody type={toast.type} />
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

/** Where toasts are drawn. It goes round the app once. */
function ToastProvider({
  children,
  ...props
}: Omit<Toast.Provider.Props, "toastManager">) {
  return (
    <Toast.Provider toastManager={toastManager} {...props}>
      {children}
      <Toasts />
    </Toast.Provider>
  );
}

export { ToastProvider, toastManager };
