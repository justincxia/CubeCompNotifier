"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Loader2, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/use-toast";
import { registerSchema, verifyOtpSchema, type RegisterInput } from "@/lib/validations";
import { NOTIFICATION_RADII, RADIUS_LABELS } from "@/types";

type Step = "details" | "verify" | "success";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [isLoading, setIsLoading] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [otp, setOtp] = useState("");

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone_number: "",
      city: "",
      state: "",
      country: "",
      notification_radius: 100,
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  async function onSubmitDetails(data: RegisterInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }

      setSubmittedPhone(data.phone_number);
      setStep("verify");
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyOtp() {
    const parsed = verifyOtpSchema.safeParse({ phone_number: submittedPhone, code: otp });
    if (!parsed.success) {
      toast({ title: "Invalid code", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: submittedPhone, code: otp }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({ title: "Verification failed", description: json.error, variant: "destructive" });
        return;
      }

      // Store user phone in localStorage for dashboard access
      localStorage.setItem("user_phone", submittedPhone);
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">You&apos;re all set!</h2>
          <p className="text-zinc-400 text-sm max-w-xs">
            We&apos;ll text you the moment a new WCA competition is announced near you.
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push("/dashboard")}>
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Phone className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white">Verify your number</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Enter the 6-digit code sent to{" "}
            <span className="text-white font-mono">{submittedPhone}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
          />
        </div>

        <Button
          variant="primary"
          onClick={onVerifyOtp}
          disabled={isLoading || otp.length < 6}
          className="w-full"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Activate"}
        </Button>

        <button
          type="button"
          className="text-xs text-zinc-500 hover:text-zinc-300 text-center transition-colors"
          onClick={() => setStep("details")}
        >
          Back to edit details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitDetails)} className="flex flex-col gap-5">
      {/* Phone */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone_number">Phone number</Label>
        <Input
          id="phone_number"
          type="tel"
          placeholder="+1 555 000 1234"
          {...register("phone_number")}
        />
        {errors.phone_number && (
          <p className="text-xs text-red-400">{errors.phone_number.message}</p>
        )}
        <p className="text-xs text-zinc-500">International format required (e.g. +1 for US/Canada)</p>
      </div>

      {/* Location */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
          <MapPin className="h-3.5 w-3.5 text-indigo-400" />
          Your location
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Boston"
            {...register("city")}
          />
          {errors.city && <p className="text-xs text-red-400">{errors.city.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="state">State / Province <span className="text-zinc-600">(optional)</span></Label>
            <Input
              id="state"
              placeholder="MA"
              {...register("state")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="United States"
              {...register("country")}
            />
            {errors.country && (
              <p className="text-xs text-red-400">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notification radius */}
      <div className="flex flex-col gap-2">
        <Label>Notification radius</Label>
        <Select
          value={String(watch("notification_radius"))}
          onValueChange={(v) => setValue("notification_radius", parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select radius" />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_RADII.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {RADIUS_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.notification_radius && (
          <p className="text-xs text-red-400">{errors.notification_radius.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full mt-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Continue <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
