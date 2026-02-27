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
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from "lucide-react";

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
// SPOTLIGHT OVERLAY — lighter during animations
// =============================================================================

function SpotlightOverlay({
  rect,
  padding = 8,
  dimmed = true,
}: {
  rect: SpotlightRect | null;
  padding?: number;
  dimmed?: boolean;
}) {
  const bg = dimmed ? "bg-black/35" : "bg-black/15";

  if (!rect) {
    return <div className={`fixed inset-0 ${bg} demo-fade-in`} />;
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
        className={`fixed inset-0 ${bg} demo-fade-in demo-spotlight-transition`}
        style={{ clipPath }}
      />
      {dimmed && (
        <div
          className="fixed rounded-2xl demo-ring-pulse pointer-events-none"
          style={{
            top: cutout.top,
            left: cutout.left,
            width: cutout.width,
            height: cutout.height,
          }}
        />
      )}
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
// PERSISTENT BOTTOM BAR — always visible, synced with step + animation
// =============================================================================

const BAR_HEIGHT = 160; // px — pinned bottom bar height

function PersistentBottomBar({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
}: {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}) {
  const { displayed, done, skip } = useTypewriter(step.description, 12);
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[104]"
      style={{ height: collapsed ? 48 : BAR_HEIGHT }}
    >
      <div
        className="h-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex flex-col transition-all duration-300"
      >
        {/* Top edge — act label + close/collapse */}
        <div className="flex items-center justify-between px-6 pt-2 pb-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step.actLabel && (
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                {step.actLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded"
              title={collapsed ? "Expand" : "Minimize"}
            >
              {collapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onExit}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
              title="Exit Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content — hidden when collapsed */}
        {!collapsed && (
          <div className="flex-1 flex items-start px-6 pt-1 pb-0 min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-snug truncate">
                {step.title}
              </h2>
              <p
                className="text-sm text-slate-600 leading-relaxed mt-0.5 line-clamp-2 cursor-pointer"
                onClick={() => !done && skip()}
              >
                {displayed}
                {!done && (
                  <span className="inline-block w-0.5 h-4 bg-sky-500 ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            </div>
          </div>
        )}

        {/* Bottom row — step counter + nav buttons */}
        <div className="flex items-center justify-between px-6 py-2 flex-shrink-0 border-t border-slate-100">
          <div className="w-20">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === stepIndex
                      ? "w-6 h-2 bg-sky-500"
                      : i < stepIndex
                      ? "w-2 h-2 bg-sky-300"
                      : "w-2 h-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-mono ml-2">
              {stepIndex + 1} of {totalSteps}
            </span>
          </div>

          <div className="w-20 flex justify-end">
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-1.5 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
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
    </div>
  );
}

// =============================================================================
// CENTER PANEL — for welcome/closing (full-screen overlay steps)
// =============================================================================

function CenterPanel({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
}: {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}) {
  const { displayed, done, skip } = useTypewriter(step.description, 10);
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  return (
    <div
      className="fixed inset-0 z-[102] flex items-center justify-center demo-fade-in"
      key={step.id}
    >
      <div className="w-[calc(100%-3rem)] max-w-2xl">
        <div className="relative demo-glass text-white rounded-3xl shadow-2xl overflow-hidden demo-narration-accent p-10">
          {/* Act Badge */}
          <div className="flex items-center justify-between mb-4">
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
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-center demo-text-shadow mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p
            className="text-lg md:text-xl text-slate-100 leading-relaxed text-center min-h-[4rem] cursor-pointer demo-text-shadow-light"
            onClick={() => !done && skip()}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-6 bg-sky-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>

          {/* Progress */}
          <div className="mt-6 mb-4">
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
          <div className="flex items-center justify-between">
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
  el.classList.add("demo-field-glow");

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;

  if (!nativeSetter) {
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.classList.remove("demo-field-glow");
    return;
  }

  // For date inputs — set value without focus (avoids native picker on mobile)
  if (el.type === "date") {
    nativeSetter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.blur(); // ensure no native picker opens
    await sleep(300);
    el.classList.remove("demo-field-glow");
    return;
  }

  // Focus only for non-date inputs (safe — no native picker)
  el.focus();

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
    cursorPosition,
    cursorState,
    nextStep,
    prevStep,
    stopDemo,
    setTransitioning,
    setMicroActionPlaying,
    clearSkipRequest,
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
  // Track whether current step's animations have played yet
  const animationsPlayedRef = useRef(false);

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

  // Get post-navigation micro-actions for a step (everything after leading set-state actions)
  const getPostNavActions = useCallback((s: DemoStep): MicroAction[] => {
    if (!s.microActions || s.microActions.length === 0) return [];
    const actions: MicroAction[] = [];
    let foundNonState = false;
    for (const a of s.microActions) {
      if (!foundNonState && a.type === "set-state") continue;
      foundNonState = true;
      actions.push(a);
    }
    return actions;
  }, []);

  // Execute micro-actions for a step — wrapped in try/finally for guaranteed cleanup
  const executeMicroActions = useCallback(
    async (actions: MicroAction[]) => {
      setMicroActionPlaying(true);
      clearSkipRequest();

      const shouldSkip = () => useDemoStore.getState().skipMicroActions;

      try {
        for (const action of actions) {
          if (shouldSkip()) {
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
                // Only click the actual DOM element if not visual-only
                if (!action.visual) {
                  const elUnder = document.elementFromPoint(pos.x, pos.y);
                  if (elUnder) {
                    (elUnder as HTMLElement).click();
                  }
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
              break;
            }
          }
        }
      } catch (err) {
        // Log but don't crash — allow cleanup to proceed
        console.warn("Demo micro-action error:", err);
      } finally {
        // Always clean up cursor and playback state
        setCursorPosition(null);
        setCursorState("idle");
        setMicroActionPlaying(false);
        clearSkipRequest();
      }
    },
    [
      setMicroActionPlaying,
      clearSkipRequest,
      setCursorState,
      setCursorPosition,
      addRipple,
    ]
  );

  // Handle "Next" — play animations first (if any), then advance
  const handleNext = useCallback(async () => {
    const currentStep = DEMO_STEPS[useDemoStore.getState().currentStepIndex];
    if (!currentStep) return;

    // If this step has post-nav animations that haven't played yet, play them first
    const postNavActions = getPostNavActions(currentStep);
    if (postNavActions.length > 0 && !animationsPlayedRef.current) {
      animationsPlayedRef.current = true;
      await executeMicroActions(postNavActions);
      // After animations complete, advance to next step
      nextStep(totalSteps);
    } else {
      // No animations (or already played) — advance immediately
      nextStep(totalSteps);
    }
  }, [executeMicroActions, getPostNavActions, nextStep, totalSteps]);

  // Step entry — ONLY navigate + run pre-nav set-state, then show bar.
  // Uses try/finally + direct zustand state checks to guarantee setTransitioning(false)
  // is always called (fixes bug where cancelled flag left transitioning stuck).
  useEffect(() => {
    if (!step) return;
    if (
      prevStepIndexRef.current === currentStepIndex &&
      currentStepIndex !== 0
    )
      return;
    prevStepIndexRef.current = currentStepIndex;
    animationsPlayedRef.current = false; // reset for new step

    const myStepIndex = currentStepIndex;
    const isStillCurrent = () =>
      useDemoStore.getState().currentStepIndex === myStepIndex;

    const executeStep = async () => {
      setTransitioning(true);

      try {
        // Execute leading set-state actions (needed before navigation)
        if (step.microActions) {
          for (const a of step.microActions) {
            if (a.type === "set-state") {
              try {
                a.action();
              } catch {
                // silently continue
              }
            } else {
              break; // stop at first non-set-state
            }
          }
          // Wait for state to settle
          const hasPreNav = step.microActions[0]?.type === "set-state";
          if (hasPreNav) {
            await sleep(step.waitAfterAction ?? 400);
          }
        }

        if (!isStillCurrent()) return;

        // Navigate if needed
        if (step.route && pathname !== step.route) {
          router.push(step.route);
          await sleep(600);
        }

        if (!isStillCurrent()) return;
        await sleep(200);
      } finally {
        // Always clear transitioning if we're still the active step
        if (isStillCurrent()) {
          setTransitioning(false);
        }
      }
      // Bar now appears — user reads the description
      // Animations wait for user to click Next
    };

    executeStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  // Safeguard: if transitioning stays stuck for more than 4 seconds, force-clear it
  useEffect(() => {
    if (!isTransitioning) return;
    const timeout = setTimeout(() => {
      if (useDemoStore.getState().isTransitioning) {
        setTransitioning(false);
      }
    }, 4000);
    return () => clearTimeout(timeout);
  }, [isTransitioning, setTransitioning]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
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
  }, [handleNext, prevStep, stopDemo]);

  if (!step) return null;

  const isCenter = step.panelPosition === "center";
  // Bar is hidden during transitions and animations — page/animation is fully visible
  const showBar = !isTransitioning && !isMicroActionPlaying;

  return (
    <>
      {/* Overlay layer — spotlight + cursor above the page */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: "none" }}
      >
        {/* Spotlight overlay — only when bar is visible (page viewing mode) */}
        {showBar && !isCenter && step.spotlightSelector && (
          <SpotlightOverlay
            rect={spotlightRect}
            padding={step.spotlightPadding}
            dimmed={true}
          />
        )}

        {/* Light overlay during animations so cursor is visible */}
        {isMicroActionPlaying && !isCenter && (
          <div className="fixed inset-0 bg-black/10 demo-fade-in" />
        )}

        {/* Transitioning spinner */}
        {isTransitioning && !isCenter && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm demo-text-shadow-light">Navigating...</span>
            </div>
          </div>
        )}

        {/* Animated Cursor — visible during micro-actions */}
        <DemoCursor
          position={cursorPosition}
          cursorState={cursorState}
          ripples={ripples}
        />
      </div>

      {/* Center panel for welcome/closing (full-screen overlay) */}
      {isCenter && (
        <CenterPanel
          step={step}
          stepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrev={prevStep}
          onExit={stopDemo}
        />
      )}

      {/* Bottom bar — pinned, hides during animations, reappears when done */}
      {!isCenter && showBar && (
        <PersistentBottomBar
          step={step}
          stepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrev={prevStep}
          onExit={stopDemo}
        />
      )}
    </>
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
