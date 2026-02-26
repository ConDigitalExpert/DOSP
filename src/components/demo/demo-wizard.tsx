"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDemoStore } from "@/stores/demo-store";
import { DEMO_STEPS, type DemoStep } from "./demo-steps";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Presentation,
} from "lucide-react";

// =============================================================================
// TYPEWRITER HOOK
// =============================================================================

function useTypewriter(text: string, speed = 16) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const skip = useCallback(() => {
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skip };
}

// =============================================================================
// SPOTLIGHT RECT HOOK
// =============================================================================

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function useSpotlightRect(
  selector: string | undefined,
  isActive: boolean,
  stepIndex: number
): SpotlightRect | null {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!isActive || !selector) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setRect(null);
      }
    };

    // Initial measurement after a short delay for rendering
    const initialTimer = setTimeout(measure, 100);

    // Re-measure on scroll/resize
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    // Periodic re-measure for dynamic content
    const interval = setInterval(measure, 500);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      clearInterval(interval);
    };
  }, [selector, isActive, stepIndex]);

  return rect;
}

// =============================================================================
// SPOTLIGHT OVERLAY COMPONENT
// =============================================================================

function SpotlightOverlay({
  rect,
  padding = 8,
}: {
  rect: SpotlightRect | null;
  padding?: number;
}) {
  if (!rect) {
    // Full dimmed overlay, no cutout
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] demo-fade-in" />
    );
  }

  const p = padding;
  const cutout = {
    top: rect.top - p,
    left: rect.left - p,
    width: rect.width + p * 2,
    height: rect.height + p * 2,
  };

  // Build clip-path polygon with evenodd — outer rect (clockwise) + inner cutout (counter-clockwise)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clipPath = `polygon(
    evenodd,
    0px 0px, ${vw}px 0px, ${vw}px ${vh}px, 0px ${vh}px, 0px 0px,
    ${cutout.left}px ${cutout.top}px,
    ${cutout.left}px ${cutout.top + cutout.height}px,
    ${cutout.left + cutout.width}px ${cutout.top + cutout.height}px,
    ${cutout.left + cutout.width}px ${cutout.top}px,
    ${cutout.left}px ${cutout.top}px
  )`;

  return (
    <>
      {/* Dimmed overlay with cutout */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] demo-fade-in"
        style={{ clipPath }}
      />
      {/* Pulsing ring around highlighted area */}
      <div
        className="fixed rounded-xl demo-ring-pulse pointer-events-none"
        style={{
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
          boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.6)",
        }}
      />
    </>
  );
}

// =============================================================================
// NARRATION PANEL COMPONENT
// =============================================================================

function NarrationPanel({
  step,
  spotlightRect,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
}: {
  step: DemoStep;
  spotlightRect: SpotlightRect | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}) {
  const { displayed, done, skip } = useTypewriter(step.description, 14);
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  // Determine panel position based on step config or spotlight location
  const position = step.panelPosition || "bottom-right";

  const positionClasses: Record<string, string> = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg",
    "bottom-right": "bottom-28 right-8 max-w-md",
    "bottom-left": "bottom-28 left-8 max-w-md",
    "top-right": "top-8 right-8 max-w-md",
    "top-left": "top-8 left-8 max-w-md",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[102] demo-panel-in`}
      key={step.id}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Act Badge + Step Counter */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          {step.actLabel && (
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              {step.actLabel}
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono ml-auto">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Title */}
        <div className="px-5 pb-2">
          <h2 className="text-xl font-bold leading-tight">{step.title}</h2>
        </div>

        {/* Description with typewriter */}
        <div className="px-5 pb-4">
          <p
            className="text-sm text-slate-300 leading-relaxed min-h-[3rem] cursor-pointer"
            onClick={() => !done && skip()}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-4 bg-sky-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-3">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-500"
              style={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 pb-4">
          <button
            onClick={onExit}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Exit Demo
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors"
            >
              {isLast ? (
                "Finish"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="text-center mt-2">
        <span className="text-[10px] text-slate-400">
          Arrow keys or Space to navigate &middot; Esc to exit
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// SVG ARROW COMPONENT
// =============================================================================

function DemoArrow({
  spotlightRect,
  panelPosition,
}: {
  spotlightRect: SpotlightRect | null;
  panelPosition?: string;
}) {
  if (!spotlightRect || panelPosition === "center") return null;

  // Calculate arrow from spotlight center to approximate panel edge
  const spotCenterX = spotlightRect.left + spotlightRect.width / 2;
  const spotCenterY = spotlightRect.top + spotlightRect.height / 2;

  let panelX: number;
  let panelY: number;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  switch (panelPosition) {
    case "bottom-right":
      panelX = vw - 220;
      panelY = vh - 200;
      break;
    case "bottom-left":
      panelX = 220;
      panelY = vh - 200;
      break;
    case "top-right":
      panelX = vw - 220;
      panelY = 120;
      break;
    case "top-left":
      panelX = 220;
      panelY = 120;
      break;
    default:
      return null;
  }

  // Only draw if there's meaningful distance
  const dx = panelX - spotCenterX;
  const dy = panelY - spotCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 100) return null;

  // Control point for curve
  const cpX = (spotCenterX + panelX) / 2 + dy * 0.15;
  const cpY = (spotCenterY + panelY) / 2 - dx * 0.15;

  const pathD = `M ${panelX} ${panelY} Q ${cpX} ${cpY} ${spotCenterX} ${spotCenterY}`;

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-[101]"
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker
          id="demo-arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8 Z" fill="rgba(14, 165, 233, 0.8)" />
        </marker>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke="rgba(14, 165, 233, 0.5)"
        strokeWidth="2"
        strokeDasharray="8 4"
        markerEnd="url(#demo-arrowhead)"
        className="demo-arrow-draw"
      />
    </svg>
  );
}

// =============================================================================
// MAIN DEMO WIZARD ORCHESTRATOR
// =============================================================================

function DemoWizardOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentStepIndex,
    isTransitioning,
    nextStep,
    prevStep,
    stopDemo,
    setTransitioning,
  } = useDemoStore();

  const step = DEMO_STEPS[currentStepIndex];
  const totalSteps = DEMO_STEPS.length;
  const prevStepIndexRef = useRef(currentStepIndex);

  // Spotlight measurement
  const spotlightRect = useSpotlightRect(
    step?.spotlightSelector,
    true,
    currentStepIndex
  );

  // Execute step action and navigation
  useEffect(() => {
    if (!step) return;
    if (prevStepIndexRef.current === currentStepIndex && currentStepIndex !== 0)
      return;
    prevStepIndexRef.current = currentStepIndex;

    let cancelled = false;

    const executeStep = async () => {
      setTransitioning(true);

      // Execute action if present
      if (step.action) {
        try {
          await step.action();
        } catch {
          // Silently continue if action fails
        }
        // Wait for state to settle
        await new Promise((r) =>
          setTimeout(r, step.waitAfterAction ?? 400)
        );
      }

      if (cancelled) return;

      // Navigate if needed
      if (step.route && pathname !== step.route) {
        router.push(step.route);
        // Wait for navigation
        await new Promise((r) => setTimeout(r, 600));
      }

      if (cancelled) return;

      // Small extra delay for DOM to render
      await new Promise((r) => setTimeout(r, 200));

      if (cancelled) return;
      setTransitioning(false);
    };

    executeStep();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextStep(totalSteps);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      } else if (e.key === "Escape") {
        e.preventDefault();
        stopDemo();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextStep, prevStep, stopDemo, totalSteps]);

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "auto" }}>
      {/* Spotlight overlay */}
      {!isTransitioning && (
        <SpotlightOverlay
          rect={spotlightRect}
          padding={step.spotlightPadding}
        />
      )}

      {/* Transitioning state — full dim overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Navigating...</span>
          </div>
        </div>
      )}

      {/* Arrow */}
      {!isTransitioning && (
        <DemoArrow
          spotlightRect={spotlightRect}
          panelPosition={step.panelPosition}
        />
      )}

      {/* Narration panel */}
      {!isTransitioning && (
        <NarrationPanel
          step={step}
          spotlightRect={spotlightRect}
          stepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={() => nextStep(totalSteps)}
          onPrev={prevStep}
          onExit={stopDemo}
        />
      )}
    </div>
  );
}

// =============================================================================
// EXPORTED LOADER — conditionally renders when demo is active
// =============================================================================

export default function DemoWizard() {
  const isActive = useDemoStore((s) => s.isActive);
  if (!isActive) return null;
  return <DemoWizardOverlay />;
}
