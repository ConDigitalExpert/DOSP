"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface IdleTimeoutModalProps {
  timeoutMs?: number;
  warningMs?: number;
  onTimeout: () => void;
  enabled?: boolean;
}

export function IdleTimeoutModal({
  timeoutMs = 120000,
  warningMs = 30000,
  onTimeout,
  enabled = true,
}: IdleTimeoutModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setCountdown(Math.floor(warningMs / 1000));
  }, [warningMs]);

  useEffect(() => {
    if (!enabled) return;

    let idleTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const startIdleTimer = () => {
      clearTimeout(idleTimer);
      clearInterval(countdownTimer);
      setShowWarning(false);
      setCountdown(Math.floor(warningMs / 1000));

      idleTimer = setTimeout(() => {
        setShowWarning(true);
        let remaining = Math.floor(warningMs / 1000);
        countdownTimer = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(countdownTimer);
            onTimeout();
          }
        }, 1000);
      }, timeoutMs - warningMs);
    };

    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];
    const handleActivity = () => {
      if (!showWarning) {
        startIdleTimer();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    startIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      clearInterval(countdownTimer);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [enabled, timeoutMs, warningMs, onTimeout, showWarning]);

  const handleContinue = () => {
    resetTimer();
  };

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-warning" />
            </div>
          </div>
          <DialogTitle className="text-2xl">Are you still there?</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            This session will reset in <span className="font-bold text-warning">{countdown}</span> seconds
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button size="kiosk" onClick={handleContinue} className="w-full">
            Yes, I&apos;m still here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
