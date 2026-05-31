"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Input } from "../ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

const inputClass =
  "h-12 w-full rounded-xl px-4 text-base outline-none transition-colors "

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  async function sendCode(target: "send" | "resend") {
    setError(null)
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    target === "resend" ? setResending(true) : setLoading(true)
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    })
    target === "resend" ? setResending(false) : setLoading(false)

    if (error) {
      setError(error.message ?? "Could not send the code. Try again.")
      return
    }
    setStep("otp")
  }

  async function verifyCode() {
    setError(null)
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.")
      return
    }
    setLoading(true)
    const { error } = await authClient.signIn.emailOtp({ email, otp })
    setLoading(false)

    if (error) {
      setError(error.message ?? "That code is invalid or expired.")
      return
    }
    router.push("/")
    router.refresh()
  }

  async function continueWithGoogle() {
    setError(null)
    setGoogleLoading(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
    if (error) {
      setGoogleLoading(false)
      setError(error.message ?? "Could not start Google sign-in.")
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center max-w-sm">
      
          <Image
            src="/icons/logo-large.svg"
            alt="Savings Tracker"
            width={230}
            height={40}
            style={{ height: "auto" }}
            className="mb-4 dark:invert-0 invert"
          />
         
     
     
      <p className="mt-1 text-sm ">
        {step === "email"
          ? "Sign in or create your account"
          : `Enter the code we sent to ${email}`}
      </p>

      <div className="my-7 h-px w-full bg-border " />

      {step === "email" ? (
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            onClick={continueWithGoogle}
            disabled={googleLoading}
            className="h-12 w-full gap-3 rounded-full "
          >
            {googleLoading ? <Loader2 className="size-5 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </Button>

        <div className="flex items-center gap-4 py-1 text-xs ">
            <span className="h-px flex-1 bg-border " />
            or
            <span className="h-px flex-1 bg-border " />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendCode("send")
            }}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="you@example.com"
                aria-invalid={!!error}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-destructive ">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full gap-2 rounded-full bg-orange-600 text-base font-semibold text-white hover:bg-orange-700"
            >
              {loading && <Loader2 className="size-5 animate-spin" />}
              Send code
            </Button>
          </form>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            verifyCode()
          }}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-center text-sm font-medium ">
              6-digit code
            </label>
            <InputOTP
              id="otp"
              maxLength={6}
              autoFocus
              value={otp}
              onChange={(value) => {
                setOtp(value)
                if (error) setError(null)
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-sm text-destructive ">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full gap-2 rounded-full bg-orange-600 text-base font-semibold text-white hover:bg-orange-700"
          >
            {loading && <Loader2 className="size-5 animate-spin" />}
            Verify & continue
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("email")
                setOtp("")
                setError(null)
              }}
              className="font-medium  transition-colors hover:text-white"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={() => sendCode("resend")}
              disabled={resending}
              className="font-medium  transition-colors hover:text-orange-400 disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground ">
        By continuing you agree to our{" "}
        <a href="/terms" className="text-foreground underline underline-offset-2 hover:text-foreground/80">
          Terms of Use
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-foreground underline underline-offset-2 hover:text-foreground/80">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
