"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  COUNTRIES,
  CURRENCIES,
  SAVINGS_CHANNELS,
  channelLabel,
  currencyForCountry,
  currencyName,
  type SavingsChannel,
} from "@/lib/locale"
import { completeOnboarding } from "@/app/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  hint: c.currency,
}))
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.name} (${c.code})`,
  hint: c.code,
}))

const STEPS = ["About you", "Where you save", "SACCO", "Review"] as const

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 aria-invalid:border-destructive"

export default function OnboardingFlow({
  defaultName,
  email,
}: {
  defaultName: string
  email: string
}) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [preferredName, setPreferredName] = useState(defaultName)
  const [country, setCountry] = useState("")
  const [currency, setCurrency] = useState("")
  const [channels, setChannels] = useState<SavingsChannel[]>([])
  const [saccoMember, setSaccoMember] = useState<boolean | null>(null)
  const [saccoName, setSaccoName] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  function handleCountry(code: string) {
    setCountry(code)
    // Auto-fill the currency from the country (user can still change it).
    const suggested = currencyForCountry(code)
    if (suggested) setCurrency(suggested)
    if (error) setError(null)
  }

  function toggleChannel(value: SavingsChannel) {
    setChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
    if (error) setError(null)
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!preferredName.trim()) return "Tell us what to call you."
      if (!country) return "Pick your country."
      if (!currency) return "Pick your currency."
    }
    if (step === 1 && channels.length === 0) {
      return "Choose at least one place you save."
    }
    if (step === 2) {
      if (saccoMember === null) return "Let us know about SACCO membership."
      if (saccoMember && !saccoName.trim()) return "Enter your SACCO's name."
    }
    if (step === 3 && !acceptTerms) {
      return "Please accept the Terms and Privacy Policy."
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    // Suggest SACCO membership when they save via a SACCO.
    if (step === 1 && saccoMember === null) {
      setSaccoMember(channels.includes("sacco"))
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function finish() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setSubmitting(true)
    const result = await completeOnboarding({
      preferredName: preferredName.trim(),
      country,
      currency,
      channels,
      saccoMember: !!saccoMember,
      saccoName: saccoMember ? saccoName.trim() : undefined,
      acceptTerms: true,
    })
    // On success the action redirects; we only get here on error.
    if (result && !result.ok) {
      setSubmitting(false)
      setError(result.error)
    }
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      {/* Progress */}
      <div className="mb-7">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-orange-500" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <Header
            title="Welcome to Savings Tracker"
            subtitle="Let's set up your account so everything reads in your currency."
          />
          <div className="space-y-2">
            <Label htmlFor="preferredName">What should we call you?</Label>
            <input
              id="preferredName"
              value={preferredName}
              onChange={(e) => {
                setPreferredName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g. Yasin"
              className={inputClass}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Signed in as {email}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Combobox
              id="country"
              options={COUNTRY_OPTIONS}
              value={country}
              onChange={handleCountry}
              placeholder="Select your country"
              searchPlaceholder="Search countries…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Combobox
              id="currency"
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(v) => {
                setCurrency(v)
                if (error) setError(null)
              }}
              placeholder="Select your currency"
              searchPlaceholder="Search currencies…"
            />
            <p className="text-xs text-muted-foreground">
              Used to display every amount across the app. You can change it later.
            </p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Header
            title="Where do you keep your savings?"
            subtitle="Pick all that apply — deposits can be tagged by where the money came from."
          />
          <div className="grid grid-cols-2 gap-3">
            {SAVINGS_CHANNELS.map((channel) => {
              const active = channels.includes(channel.value)
              return (
                <button
                  key={channel.value}
                  type="button"
                  onClick={() => toggleChannel(channel.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors",
                    active
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="font-semibold text-foreground">{channel.label}</span>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border",
                        active
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {active && <Check className="size-3.5" />}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">{channel.hint}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Header
            title="Do you belong to a SACCO?"
            subtitle="A savings & credit cooperative. This helps tailor your experience."
          />
          <RadioGroup
            value={saccoMember === null ? "" : saccoMember ? "yes" : "no"}
            onValueChange={(v) => {
              setSaccoMember(v === "yes")
              if (error) setError(null)
            }}
            className="gap-3"
          >
            {[
              { v: "yes", label: "Yes, I'm a SACCO member" },
              { v: "no", label: "No, I don't belong to one" },
            ].map((opt) => (
              <label
                key={opt.v}
                htmlFor={`sacco-${opt.v}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                  (saccoMember === (opt.v === "yes"))
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-border hover:bg-muted"
                )}
              >
                <RadioGroupItem value={opt.v} id={`sacco-${opt.v}`} />
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
          {saccoMember && (
            <div className="space-y-2">
              <Label htmlFor="saccoName">SACCO name</Label>
              <input
                id="saccoName"
                value={saccoName}
                onChange={(e) => {
                  setSaccoName(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="e.g. Wazalendo SACCO"
                className={inputClass}
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <Header
            title="Quick review"
            subtitle="Confirm your details and accept the terms to get started."
          />
          <dl className="divide-y divide-border rounded-2xl border">
            <Row label="Name" value={preferredName.trim() || "—"} />
            <Row
              label="Country"
              value={COUNTRIES.find((c) => c.code === country)?.name ?? "—"}
            />
            <Row label="Currency" value={`${currencyName(currency)} (${currency})`} />
            <Row
              label="Saves via"
              value={channels.map(channelLabel).join(", ") || "—"}
            />
            <Row
              label="SACCO"
              value={saccoMember ? saccoName.trim() || "Member" : "Not a member"}
            />
          </dl>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked)
                if (error) setError(null)
              }}
              className="mt-0.5 size-4 accent-orange-500"
            />
            <span>
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-foreground underline underline-offset-2"
              >
                Terms of Use
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-foreground underline underline-offset-2"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </div>
      )}

      {error && <p className="mt-5 text-sm text-destructive">{error}</p>}

      {/* Footer nav */}
      <div className="mt-7 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0 || submitting}
          className="h-11 gap-2 rounded-full px-4 disabled:opacity-0"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={next}
            className="h-11 gap-2 rounded-full bg-orange-600 px-6 text-white hover:bg-orange-700"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={finish}
            disabled={submitting}
            className="h-11 gap-2 rounded-full bg-orange-600 px-6 text-white hover:bg-orange-700"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Finish setup
          </Button>
        )}
      </div>
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
