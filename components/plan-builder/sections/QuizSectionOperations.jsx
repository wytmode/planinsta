"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronLeft, CheckCircle2, ChevronsUpDown } from "lucide-react";

const TEAM_SIZE_OPTIONS = [
  "Just me",
  "2–5 people",
  "6–10 people",
  "11–20 employees",
  "21–50 employees",
  "51–100 employees",
  "100+ employees",
];

export default function QuizSectionOperations({
  currentSection = 6,
  totalSections = 11,
  defaultValues = {},
  onSubmit,
  onPrevious,
}) {
  const [operationLocation, setOperationLocation] = useState(
    defaultValues.operationLocation || ""
  );
  const [teamSize, setTeamSize] = useState(defaultValues.teamSize || "");

  useEffect(() => {
    document.body.classList.remove("glass-bg");
  }, []);

  const percent = useMemo(
    () => Math.round((currentSection / Math.max(1, totalSections)) * 100),
    [currentSection, totalSections]
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setSubmitted(true);

    const submitter = e?.nativeEvent?.submitter;
    const isContinue = submitter && submitter.id === "continueBtn";
    if (!isContinue) return;

    onSubmit?.({
      operationLocation,
      teamSize,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-start justify-center overflow-hidden">
      <div className="w-full max-w-5xl px-4 md:px-6 pt-8 pb-24">
        {/* Top bar */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-6 mb-6 bg-white/80 md:bg-white/60 md:backdrop-blur-md border-b shadow-sm">
          <div className="px-4 md:px-6 py-3 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              Section {currentSection} of {totalSections}
            </span>
            <div className="flex-1" />
            <span className="text-sm text-slate-500">{percent}% Complete</span>
          </div>
          <div className="px-4 md:px-6 pb-3">
            <Progress
              value={percent}
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:via-rose-500 [&>div]:to-indigo-500"
            />
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl shadow-sm bg-white p-6 md:p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-3 -right-3 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
          >
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> guided
            </span>
          </motion.div>

          {/* Header */}
          <header className="text-center space-y-3 mb-6">
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Operations &amp; Team
            </h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-indigo-600">
              Outline your business operations and team structure
            </p>
          </header>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
            <Field
              label="Where is your business located?"
              hint="Your main business operation location"
            >
              <Lift>
                <Input
                  value={operationLocation}
                  onChange={(e) => setOperationLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="h-12 text-lg leading-7 bg-white border-0 outline-none focus-visible:ring-0 focus-visible:outline-none"
                />
              </Lift>
            </Field>

            <Field
              label="What's your current team size?"
              hint="Pick a range or type your own (exact number or phrase)."
            >
              <Lift>
                <TeamSizeCombobox
                  value={teamSize}
                  onChange={setTeamSize}
                  options={TEAM_SIZE_OPTIONS}
                  placeholder="e.g., 5 people, Just me, 10–20 employees"
                />
              </Lift>

              <p className="text-xs text-slate-500 mt-1">
                You can pick from the list or type your own value.
              </p>
            </Field>

            {/* Nav */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="rounded-xl px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Section
              </Button>
              <Button
                id="continueBtn"
                type="submit"
                className="
                  rounded-xl px-6 py-2.5
                  bg-white text-slate-900 border border-slate-300
                  hover:bg-indigo-700 hover:text-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2
                  active:scale-[0.98] transition-colors duration-200
                "
              >
                Continue
              </Button>
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved. You can refine this later.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* --------------------------- UI helpers --------------------------- */
function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold leading-7">{label}</Label>
      {hint && <p className="text-base text-slate-600 leading-7">{hint}</p>}
      {children}
    </div>
  );
}

function Lift({ children }) {
  return (
    <div className="group relative rounded-2xl">
      <div
        className="
          rounded-2xl bg-white
          border-2 border-indigo-200
          px-3 py-2
          transition-colors
          group-focus-within:border-indigo-400
          group-focus-within:ring-2 group-focus-within:ring-indigo-500/30
        "
      >
        {children}
      </div>
    </div>
  );
}

/* --------------------------- Simple Combobox --------------------------- */
function TeamSizeCombobox({ value, onChange, options = [], placeholder }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const boxRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const visible = options.filter((o) =>
    (filter || value).length
      ? o.toLowerCase().includes((filter || value).toLowerCase())
      : true
  );

  return (
    <div ref={boxRef} className="relative">
      {/* Input (white bg). Clicking focuses & opens options */}
      <Input
        value={value}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          onChange?.(e.target.value);
          setFilter(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className="h-12 text-lg leading-7 bg-white border border-slate-200 rounded-xl pr-10"
      />

      {/* Chevron button to toggle */}
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-slate-600 hover:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle options"
      >
        <ChevronsUpDown className="h-4 w-4" />
      </button>

      {/* Dropdown (white) anchored to the same field */}
      {open && (
        <div className="absolute z-20 mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {visible.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
          ) : (
            <ul className="py-1">
              {visible.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // keep input focus
                    onClick={() => {
                      onChange?.(opt);
                      setFilter("");
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
