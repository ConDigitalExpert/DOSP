"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDemoStore } from "@/stores/demo-store";
import { DEMO_STEPS, type DemoStep, type MicroAction } from "./demo-steps";
import {
  ChevronLeft,
  ChevronRight,
  PanelBottom,
  LayoutGrid,
  GripHorizontal,
} from "lucide-react";

// =============================================================================
// UTILITIES
// =============================================================================

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForElement(
  selector: string,
  timeout = 3000
): Promise<Element | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(50);
  }
  return null;
}

function getElementCenter(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function getElementInputStart(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + 24, y: r.top + r.height / 2 };
}

// =============================================================================
// TYPEWRITER HOOK
// =============================================================================

function useTypewriter(text: string, speed = 14) {
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
// DRAGGABLE HOOK
// =============================================================================

function useDraggable() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  // Reset offset when step changes
  const resetOffset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    },
    [offset]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setOffset({
      x: offsetStart.current.x + (e.clientX - dragStart.current.x),
      y: offsetStart.current.y + (e.clientY - dragStart.current.y),
    });
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    offset,
    resetOffset,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
  };
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

    const initialTimer = setTimeout(measure, 100);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
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
    return (
      <div className="fixed inset-0 bg-black/40 demo-fade-in" />
    );
  }

  const p = padding;
  const cutout = {
    top: rect.top - p,
    left: rect.left - p,
    width: rect.width + p * 2,
    height: rect.height + p * 2,
  };

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
      <div
        className="fixed inset-0 bg-black/40 demo-fade-in demo-spotlight-transition"
        style={{ clipPath }}
      />
      <div
        className="fixed rounded-2xl demo-ring-pulse pointer-events-none"
        style={{
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
        }}
      />
    </>
  );
}

// =============================================================================
// DEMO CURSOR COMPONENT
// =============================================================================

function DemoCursor({
  position,
  cursorState,
  ripples,
}: {
  position: { x: number; y: number } | null;
  cursorState: string;
  ripples: Array<{ id: number; x: number; y: number }>;
}) {
  if (!position) return null;

  return (
    <div className="fixed inset-0 z-[103] pointer-events-none">
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="demo-cursor-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}

      {/* Cursor icon */}
      <div
        className="absolute"
        style={{
          left: position.x,
          top: position.y,
          transition:
            cursorState === "moving"
              ? "left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          transform: cursorState === "clicking" ? "scale(0.85)" : "scale(1)",
        }}
      >
        {/* SVG cursor pointer */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill="white"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        {/* Glow effect */}
        <div
          className="absolute -inset-2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(14,165,233,0.4) 0%, transparent 70%)",
          }}
        />
        {/* Typing indicator */}
        {cursorState === "typing" && (
          <div
            className="absolute left-7 top-2 w-0.5 h-5 bg-sky-400"
            style={{ animation: "demoCursorBlink 0.8s infinite" }}
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// CINEMATIC NARRATION BAR (Bottom Bar Style — Glass + Draggable)
// =============================================================================

function CinematicNarrationBar({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
  onToggleStyle,
  dragOffset,
  dragHandleProps,
}: {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  onToggleStyle: () => void;
  dragOffset: { x: number; y: number };
  dragHandleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
}) {
  const { displayed, done, skip } = useTypewriter(step.description, 12);
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  return (
    <div
      className="fixed bottom-6 left-1/2 w-[calc(100%-3rem)] max-w-4xl z-[102] demo-bar-in"
      key={step.id}
      style={{
        transform: `translateX(calc(-50% + ${dragOffset.x}px)) translateY(${dragOffset.y}px)`,
      }}
    >
      <div className="relative demo-glass text-white rounded-2xl shadow-2xl overflow-hidden demo-narration-accent">
        {/* Drag Handle */}
        <div
          className="demo-drag-handle flex items-center justify-center pt-2 pb-0"
          {...dragHandleProps}
        >
          <GripHorizontal className="w-5 h-5 text-white/30" />
        </div>

        {/* Act Badge + Step Counter */}
        <div className="flex items-center justify-between px-8 pt-2 pb-1">
          {step.actLabel && (
            <span className="text-sm font-semibold text-sky-400 uppercase tracking-widest demo-text-shadow-light">
              {step.actLabel}
            </span>
          )}
          <span className="text-sm text-slate-300 font-mono ml-auto demo-text-shadow-light">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Title */}
        <div className="px-8 pb-2">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight demo-text-shadow">
            {step.title}
          </h2>
        </div>

        {/* Description with typewriter */}
        <div className="px-8 pb-4">
          <p
            className="text-base md:text-lg text-slate-100 leading-relaxed min-h-[3.5rem] cursor-pointer demo-text-shadow-light"
            onClick={() => !done && skip()}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-5 bg-sky-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pb-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
              style={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-8 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Exit Demo
            </button>
            <button
              onClick={onToggleStyle}
              className="text-white/40 hover:text-white/70 transition-colors p-1 rounded"
              title="Switch to floating card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-5 py-2 text-sm font-medium bg-sky-500/80 hover:bg-sky-500 text-white rounded-lg transition-colors"
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
        <span className="text-xs text-white/30 demo-text-shadow-light">
          Arrow keys or Space to navigate &middot; Esc to exit &middot; Drag to move
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// FLOATING NARRATION CARD (Glass + Draggable)
// =============================================================================

function FloatingNarrationCard({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
  onToggleStyle,
  dragOffset,
  dragHandleProps,
}: {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  onToggleStyle: () => void;
  dragOffset: { x: number; y: number };
  dragHandleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
}) {
  const { displayed, done, skip } = useTypewriter(step.description, 12);
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  const position = step.panelPosition || "bottom-right";

  const positionClasses: Record<string, string> = {
    center: "top-1/2 left-1/2 max-w-xl",
    bottom: "bottom-28 left-1/2 max-w-xl",
    "bottom-right": "bottom-28 right-8 max-w-xl",
    "bottom-left": "bottom-28 left-8 max-w-xl",
    "top-right": "top-8 right-8 max-w-xl",
    "top-left": "top-8 left-8 max-w-xl",
  };

  // Calculate base transform from position, then add drag offset
  const baseTransforms: Record<string, string> = {
    center: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
    bottom: `translate(calc(-50% + ${dragOffset.x}px), ${dragOffset.y}px)`,
    "bottom-right": `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
    "bottom-left": `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
    "top-right": `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
    "top-left": `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[102] demo-panel-in`}
      key={step.id}
      style={{ transform: baseTransforms[position] }}
    >
      <div className="relative demo-glass text-white rounded-2xl shadow-2xl overflow-hidden demo-narration-accent">
        {/* Drag Handle */}
        <div
          className="demo-drag-handle flex items-center justify-center pt-2 pb-0"
          {...dragHandleProps}
        >
          <GripHorizontal className="w-5 h-5 text-white/30" />
        </div>

        {/* Act Badge + Step Counter */}
        <div className="flex items-center justify-between px-6 pt-2 pb-1">
          {step.actLabel && (
            <span className="text-sm font-semibold text-sky-400 uppercase tracking-widest demo-text-shadow-light">
              {step.actLabel}
            </span>
          )}
          <span className="text-sm text-slate-300 font-mono ml-auto demo-text-shadow-light">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Title */}
        <div className="px-6 pb-2">
          <h2 className="text-2xl font-bold leading-tight tracking-tight demo-text-shadow">
            {step.title}
          </h2>
        </div>

        {/* Description with typewriter */}
        <div className="px-6 pb-4">
          <p
            className="text-base text-slate-100 leading-relaxed min-h-[3rem] cursor-pointer demo-text-shadow-light"
            onClick={() => !done && skip()}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-5 bg-sky-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
              style={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Exit Demo
            </button>
            <button
              onClick={onToggleStyle}
              className="text-white/40 hover:text-white/70 transition-colors p-1 rounded"
              title="Switch to bottom bar"
            >
              <PanelBottom className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-5 py-2 text-sm font-medium bg-sky-500/80 hover:bg-sky-500 text-white rounded-lg transition-colors"
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
        <span className="text-xs text-white/30 demo-text-shadow-light">
          Arrow keys or Space &middot; Esc to exit &middot; Drag to move
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// CENTER PANEL (for welcome/closing — Glass + Draggable)
// =============================================================================

function CenterPanel({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
  dragOffset,
  dragHandleProps,
}: {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  dragOffset: { x: number; y: number };
  dragHandleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
}) {
  const { displayed, done, skip } = useTypewriter(step.description, 10);
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  return (
    <div
      className="fixed top-1/2 left-1/2 w-[calc(100%-3rem)] max-w-2xl z-[102] demo-panel-in"
      key={step.id}
      style={{
        transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
      }}
    >
      <div className="relative demo-glass text-white rounded-3xl shadow-2xl overflow-hidden demo-narration-accent">
        {/* Drag Handle */}
        <div
          className="demo-drag-handle flex items-center justify-center pt-3 pb-0"
          {...dragHandleProps}
        >
          <GripHorizontal className="w-5 h-5 text-white/30" />
        </div>

        {/* Act Badge */}
        <div className="flex items-center justify-between px-10 pt-2 pb-2">
          {step.actLabel && (
            <span className="text-sm font-semibold text-sky-400 uppercase tracking-widest demo-text-shadow-light">
              {step.actLabel}
            </span>
          )}
          <span className="text-sm text-slate-300 font-mono ml-auto demo-text-shadow-light">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Title */}
        <div className="px-10 pb-3 text-center">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight demo-text-shadow">
            {step.title}
          </h2>
        </div>

        {/* Description */}
        <div className="px-10 pb-6 text-center">
          <p
            className="text-lg md:text-xl text-slate-100 leading-relaxed min-h-[4rem] cursor-pointer demo-text-shadow-light"
            onClick={() => !done && skip()}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-6 bg-sky-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>

        {/* Progress */}
        <div className="px-10 pb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
              style={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-10 pb-6">
          <button
            onClick={onExit}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Exit Demo
          </button>

          <div className="flex items-center gap-3">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-6 py-2.5 text-base font-medium bg-sky-500/80 hover:bg-sky-500 text-white rounded-xl transition-colors"
            >
              {isLast ? (
                "Finish"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MICRO-ACTION EXECUTOR
// =============================================================================

async function typeIntoInput(
  el: HTMLInputElement,
  value: string,
  durationMs: number,
  shouldSkip: () => boolean
) {
  el.focus();
  el.classList.add("demo-field-glow");

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;

  if (!nativeSetter) {
    // Fallback: set value directly
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.classList.remove("demo-field-glow");
    return;
  }

  // For date inputs, set the full value at once
  if (el.type === "date") {
    nativeSetter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(300);
    el.classList.remove("demo-field-glow");
    return;
  }

  // For text inputs, type char by char
  const charDelay = Math.max(30, durationMs / value.length);
  for (let i = 0; i < value.length; i++) {
    if (shouldSkip()) {
      nativeSetter.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      break;
    }
    const partial = value.slice(0, i + 1);
    nativeSetter.call(el, partial);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(charDelay);
  }

  el.classList.remove("demo-field-glow");
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
    isMicroActionPlaying,
    skipMicroActions,
    panelStyle,
    cursorPosition,
    cursorState,
    nextStep,
    prevStep,
    stopDemo,
    setTransitioning,
    setMicroActionPlaying,
    clearSkipRequest,
    togglePanelStyle,
    setCursorPosition,
    setCursorState,
  } = useDemoStore();

  const step = DEMO_STEPS[currentStepIndex];
  const totalSteps = DEMO_STEPS.length;
  const prevStepIndexRef = useRef(currentStepIndex);
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const rippleIdRef = useRef(0);

  // Draggable panel
  const { offset: dragOffset, resetOffset, dragHandleProps } = useDraggable();

  // Reset drag offset when step changes
  useEffect(() => {
    resetOffset();
  }, [currentStepIndex, resetOffset]);

  // Spotlight measurement
  const spotlightRect = useSpotlightRect(
    step?.spotlightSelector,
    true,
    currentStepIndex
  );

  // Add ripple effect
  const addRipple = useCallback(
    (x: number, y: number) => {
      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    },
    []
  );

  // Execute micro-actions for a step
  const executeMicroActions = useCallback(
    async (actions: MicroAction[]) => {
      setMicroActionPlaying(true);
      clearSkipRequest();

      const shouldSkip = () => useDemoStore.getState().skipMicroActions;

      for (const action of actions) {
        if (shouldSkip()) {
          // Fast-forward: execute remaining set-state actions silently
          if (action.type === "set-state") {
            try {
              action.action();
            } catch {
              // silently continue
            }
          }
          continue;
        }

        switch (action.type) {
          case "set-state": {
            try {
              action.action();
            } catch {
              // silently continue
            }
            await sleep(100);
            break;
          }

          case "wait": {
            if (!shouldSkip()) await sleep(action.ms);
            break;
          }

          case "cursor-move": {
            const el = await waitForElement(action.selector);
            if (el) {
              setCursorState("moving");
              const isInput =
                el instanceof HTMLInputElement ||
                el instanceof HTMLTextAreaElement;
              const pos = isInput
                ? getElementInputStart(el)
                : getElementCenter(el);
              setCursorPosition(pos);
              await sleep(action.durationMs ?? 500);
            }
            setCursorState("idle");
            break;
          }

          case "cursor-click": {
            const pos = useDemoStore.getState().cursorPosition;
            if (pos) {
              setCursorState("clicking");
              addRipple(pos.x, pos.y);
              // Click the element under the cursor
              const elUnder = document.elementFromPoint(pos.x, pos.y);
              if (elUnder) {
                (elUnder as HTMLElement).click();
              }
              await sleep(200);
              setCursorState("idle");
            }
            break;
          }

          case "type-into": {
            const el = await waitForElement(action.selector);
            if (el && el instanceof HTMLInputElement) {
              setCursorState("typing");
              await typeIntoInput(
                el,
                action.value,
                action.durationMs ?? 1000,
                shouldSkip
              );
              setCursorState("idle");
            }
            break;
          }

          case "select-button": {
            const el = await waitForElement(action.selector);
            if (el) {
              setCursorState("moving");
              const pos = getElementCenter(el);
              setCursorPosition(pos);
              await sleep(400);
              setCursorState("clicking");
              addRipple(pos.x, pos.y);
              (el as HTMLElement).click();
              await sleep(200);
              setCursorState("idle");
            }
            break;
          }

          case "spotlight": {
            // Spotlight updates are handled by the step's spotlightSelector
            // This is for mid-step spotlight changes
            break;
          }
        }
      }

      // Hide cursor after micro-actions complete
      setCursorPosition(null);
      setCursorState("idle");
      setMicroActionPlaying(false);
      clearSkipRequest();
    },
    [
      setMicroActionPlaying,
      clearSkipRequest,
      setCursorState,
      setCursorPosition,
      addRipple,
    ]
  );

  // Execute step action and navigation
  useEffect(() => {
    if (!step) return;
    if (
      prevStepIndexRef.current === currentStepIndex &&
      currentStepIndex !== 0
    )
      return;
    prevStepIndexRef.current = currentStepIndex;

    let cancelled = false;

    const executeStep = async () => {
      setTransitioning(true);

      // Handle steps with microActions
      if (step.microActions && step.microActions.length > 0) {
        // Execute set-state actions first (before navigation)
        const preNavActions = [];
        const postNavActions = [];
        let foundNonState = false;
        for (const a of step.microActions) {
          if (!foundNonState && a.type === "set-state") {
            preNavActions.push(a);
          } else {
            foundNonState = true;
            postNavActions.push(a);
          }
        }

        // Execute pre-navigation state actions
        for (const a of preNavActions) {
          if (a.type === "set-state") {
            try {
              a.action();
            } catch {
              // silently continue
            }
          }
        }

        if (preNavActions.length > 0) {
          await sleep(step.waitAfterAction ?? 400);
        }

        if (cancelled) return;

        // Navigate if needed
        if (step.route && pathname !== step.route) {
          router.push(step.route);
          await sleep(600);
        }

        if (cancelled) return;
        await sleep(200);

        if (cancelled) return;
        setTransitioning(false);

        // Execute remaining micro-actions (cursor moves, typing, etc.)
        if (postNavActions.length > 0) {
          await executeMicroActions(postNavActions);
        }
      } else {
        // Legacy path: no micro-actions, just navigate
        if (step.route && pathname !== step.route) {
          router.push(step.route);
          await sleep(600);
        }

        if (cancelled) return;
        await sleep(200);

        if (cancelled) return;
        setTransitioning(false);
      }
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

  // Determine which panel to render
  const isCenter = step.panelPosition === "center";

  const panelProps = {
    step,
    stepIndex: currentStepIndex,
    totalSteps,
    onNext: () => nextStep(totalSteps),
    onPrev: prevStep,
    onExit: stopDemo,
    onToggleStyle: togglePanelStyle,
    dragOffset,
    dragHandleProps,
  };

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "auto" }}>
      {/* Spotlight overlay — lighter dimming so content shows through */}
      {!isTransitioning && (
        <SpotlightOverlay
          rect={spotlightRect}
          padding={step.spotlightPadding}
        />
      )}

      {/* Transitioning state */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm demo-text-shadow-light">Navigating...</span>
          </div>
        </div>
      )}

      {/* Animated Cursor */}
      <DemoCursor
        position={cursorPosition}
        cursorState={cursorState}
        ripples={ripples}
      />

      {/* Narration panel — choose style */}
      {!isTransitioning && (
        <>
          {isCenter ? (
            <CenterPanel {...panelProps} />
          ) : panelStyle === "bar" ? (
            <CinematicNarrationBar {...panelProps} />
          ) : (
            <FloatingNarrationCard {...panelProps} />
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTED LOADER
// =============================================================================

export default function DemoWizard() {
  const isActive = useDemoStore((s) => s.isActive);
  if (!isActive) return null;
  return <DemoWizardOverlay />;
}
