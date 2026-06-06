"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useState } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LogOut,
  Pencil,
  RefreshCcw,
  Save,
} from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter-text";
import { cn } from "@/lib/utils";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthSession {
  token: string;
  user: AuthUser | null;
}

interface AuthResponse {
  message?: string;
  token?: string;
  user?: AuthUser;
}

type StatusState = {
  type: "info" | "success" | "error";
  text: string;
};

interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

interface AuthUIProps {
  apiBaseUrl?: string;
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
  storageKey?: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ProfileFormData {
  name: string;
  email: string;
}

const emptySession: AuthSession = {
  token: "",
  user: null,
};

const hiddenStatus: StatusState = {
  type: "info",
  text: "",
};

const defaultStatus: StatusState = {
  type: "info",
  text: "",
};

const emptyProfileForm: ProfileFormData = {
  name: "",
  email: "",
};

const defaultSignInContent = {
  image: {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    alt: "Modern office workspace with warm lighting",
  },
  quote: {
    text: "Welcome back. Your project flow is ready to continue.",
    author: "Day1 Auth UI",
  },
};

const defaultSignUpContent = {
  image: {
    src: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1400&q=80",
    alt: "Bright collaborative workspace for new beginnings",
  },
  quote: {
    text: "Create your account and launch the next step of your journey.",
    author: "Day1 Auth UI",
  },
};

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-input/50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="grid w-full items-center gap-2">
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <div className="relative">
          <Input
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={cn("pe-10", className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

function readStoredSession(storageKey: string) {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? (JSON.parse(rawValue) as AuthSession) : emptySession;
  } catch {
    return emptySession;
  }
}

function createAvatarUrl(user: AuthUser) {
  return `https://i.pravatar.cc/320?u=${encodeURIComponent(user.email)}`;
}

function getMemberSince(createdAt?: string) {
  if (!createdAt) {
    return "Member since today";
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return "Member since today";
  }

  return `Member since ${createdDate.getFullYear()}`;
}

function StatusBanner({ status }: { status: StatusState }) {
  if (!status.text) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        status.type === "info" &&
        "border-primary/20 bg-primary/10 text-primary-foreground",
        status.type === "success" &&
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
        status.type === "error" &&
        "border-rose-400/20 bg-rose-400/10 text-rose-100",
      )}
    >
      {status.text}
    </div>
  );
}

function ProfileNotice({ status }: { status: StatusState }) {
  if (!status.text) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-4 text-sm shadow-sm",
        status.type === "success" &&
        "border-emerald-200 bg-emerald-50 text-emerald-700",
        status.type === "error" &&
        "border-rose-200 bg-rose-50 text-rose-700",
        status.type === "info" &&
        "border-sky-200 bg-sky-50 text-sky-700",
      )}
    >
      {status.text}
    </div>
  );
}

function SignInForm({
  data,
  isLoading,
  onChange,
  onSubmit,
}: {
  data: SignInData;
  isLoading: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to sign in
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={data.email}
            onChange={onChange}
          />
        </div>
        <PasswordInput
          id="sign-in-password"
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={data.password}
          onChange={onChange}
        />
        <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="animate-spin" /> : null}
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({
  data,
  isLoading,
  onChange,
  onSubmit,
}: {
  data: SignUpData;
  isLoading: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to sign up
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sign-up-name">Full Name</Label>
          <Input
            id="sign-up-name"
            name="name"
            type="text"
            placeholder="Soham Deb"
            required
            autoComplete="name"
            value={data.name}
            onChange={onChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sign-up-email">Email</Label>
          <Input
            id="sign-up-email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={data.email}
            onChange={onChange}
          />
        </div>
        <PasswordInput
          id="sign-up-password"
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="Password"
          value={data.password}
          onChange={onChange}
        />
        <PasswordInput
          id="sign-up-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          required
          autoComplete="new-password"
          placeholder="Confirm password"
          value={data.confirmPassword}
          onChange={onChange}
        />
        <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="animate-spin" /> : null}
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isLoading,
  isSignIn,
  onToggle,
  signInData,
  signUpData,
  status,
  onSignInChange,
  onSignUpChange,
  onSignInSubmit,
  onSignUpSubmit,
}: {
  isLoading: boolean;
  isSignIn: boolean;
  onToggle: () => void;
  signInData: SignInData;
  signUpData: SignUpData;
  status: StatusState;
  onSignInChange: React.ChangeEventHandler<HTMLInputElement>;
  onSignUpChange: React.ChangeEventHandler<HTMLInputElement>;
  onSignInSubmit: React.FormEventHandler<HTMLFormElement>;
  onSignUpSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[390px] gap-4">
      {isSignIn ? (
        <SignInForm
          data={signInData}
          isLoading={isLoading}
          onChange={onSignInChange}
          onSubmit={onSignInSubmit}
        />
      ) : (
        <SignUpForm
          data={signUpData}
          isLoading={isLoading}
          onChange={onSignUpChange}
          onSubmit={onSignUpSubmit}
        />
      )}

      <StatusBanner status={status} />

      <div className="text-center text-sm text-muted-foreground">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button
          variant="link"
          className="pl-1 text-foreground"
          onClick={onToggle}
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  name,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  name: keyof ProfileFormData;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
}) {
  return (
    <label className="grid gap-3">
      <span className="text-lg font-medium text-slate-200">{label}</span>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={cn(
          "h-18 rounded-3xl border-white/10 bg-white/8 px-7 py-4 text-lg text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.2)] placeholder:text-slate-500 focus-visible:bg-white/12 focus-visible:ring-blue-500/40",
          readOnly &&
          "cursor-default bg-white/5 text-slate-500 focus-visible:ring-0",
        )}
      />
    </label>
  );
}

function ProfilePage({
  isLoading,
  profileData,
  sessionUser,
  status,
  onFieldChange,
  onRefreshProfile,
  onSaveProfile,
  onLogout,
}: {
  isLoading: boolean;
  profileData: ProfileFormData;
  sessionUser: AuthUser;
  status: StatusState;
  onFieldChange: React.ChangeEventHandler<HTMLInputElement>;
  onRefreshProfile: () => Promise<void>;
  onSaveProfile: React.FormEventHandler<HTMLFormElement>;
  onLogout: () => void;
}) {
  const avatarStorageKey = `user-avatar-${sessionUser.id}`;
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(avatarStorageKey) ?? null;
    } catch {
      return null;
    }
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Crop modal state ──────────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [cropRotate, setCropRotate] = useState(0);
  const [cropBrightness, setCropBrightness] = useState(1);
  const [cropContrast, setCropContrast] = useState(1);
  const [cropSaturate, setCropSaturate] = useState(1);
  // fitScale = scale at which the full image fits inside the crop circle
  const [fitScale, setFitScale] = useState(0.3);
  const fitScaleRef = React.useRef(0.3); // always-fresh value for resetEdits closure
  const isDraggingRef = React.useRef(false);
  const dragOriginRef = React.useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const cropImgRef = React.useRef<HTMLImageElement>(null);
  const CROP_SIZE = 256;

  function resetEdits() {
    setCropPos({ x: 0, y: 0 });
    setCropScale(fitScaleRef.current);  // zoom out to show full photo
    setCropRotate(0);
    setCropBrightness(1);
    setCropContrast(1);
    setCropSaturate(1);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        // compute the scale that makes the whole image fit inside the circle
        const probe = new Image();
        probe.onload = () => {
          const fs = Math.min(CROP_SIZE / probe.naturalWidth, CROP_SIZE / probe.naturalHeight);
          fitScaleRef.current = fs;
          setFitScale(fs);
          setCropSrc(result);
          setCropPos({ x: 0, y: 0 });
          setCropScale(fs); // start fully zoomed-out so user sees entire photo
          setCropRotate(0);
          setCropBrightness(1);
          setCropContrast(1);
          setCropSaturate(1);
        };
        probe.src = result;
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleCropMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDraggingRef.current = true;
    dragOriginRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: cropPos.x,
      posY: cropPos.y,
    };
  }

  function handleCropMouseMove(e: React.MouseEvent) {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragOriginRef.current.mouseX;
    const dy = e.clientY - dragOriginRef.current.mouseY;
    setCropPos({ x: dragOriginRef.current.posX + dx, y: dragOriginRef.current.posY + dy });
  }

  function handleCropMouseUp() {
    isDraggingRef.current = false;
  }

  function handleCropConfirm() {
    if (!cropSrc) return;
    const canvas = document.createElement("canvas");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // apply CSS-equivalent filters
    ctx.filter = `brightness(${cropBrightness}) contrast(${cropContrast}) saturate(${cropSaturate})`;
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    const img = new Image();
    img.onload = () => {
      const cx = CROP_SIZE / 2;
      const cy = CROP_SIZE / 2;
      const scaledW = img.width * cropScale;
      const scaledH = img.height * cropScale;
      ctx.save();
      ctx.translate(cx + cropPos.x, cy + cropPos.y);
      ctx.rotate((cropRotate * Math.PI) / 180);
      ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
      ctx.restore();
      const result = canvas.toDataURL("image/jpeg", 0.92);
      setCustomAvatar(result);
      try { window.localStorage.setItem(avatarStorageKey, result); } catch { /* ignore */ }
      setCropSrc(null);
    };
    img.src = cropSrc;
  }
  // ─────────────────────────────────────────────────────────────────

  const avatarSrc = customAvatar ?? createAvatarUrl(sessionUser);

  return (
    <div
      className="relative min-h-screen text-slate-100"
      style={{
        backgroundImage: "url(/bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* ── Crop Modal ──────────────────────────────────────────────── */}
      {cropSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Edit &amp; Crop Photo</h2>
              <button type="button" onClick={resetEdits} className="rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/20">Reset All</button>
            </div>
            <p className="w-full text-left text-xs text-slate-400">Drag to reposition · scroll slider to zoom</p>

            {/* Circular viewport */}
            <div
              className="relative overflow-hidden rounded-full border-4 border-white/30 shadow-xl"
              style={{ width: CROP_SIZE, height: CROP_SIZE, cursor: "grab", flexShrink: 0 }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            >
              <img
                ref={cropImgRef}
                src={cropSrc!}
                alt="crop preview"
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${cropPos.x}px), calc(-50% + ${cropPos.y}px)) scale(${cropScale}) rotate(${cropRotate}deg)`,
                  transformOrigin: "center",
                  maxWidth: "none",
                  userSelect: "none",
                  pointerEvents: "none",
                  filter: `brightness(${cropBrightness}) contrast(${cropContrast}) saturate(${cropSaturate})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/40" />
            </div>

            {/* Sliders grid */}
            <div className="grid w-full gap-3">
              {/* Zoom */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-right text-xs text-slate-400">Zoom</span>
                <input type="range" min={fitScale * 0.8} max={3} step={0.001} value={cropScale}
                  onChange={(e) => setCropScale(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white" />
                <span className="w-8 text-right text-xs text-slate-300">{cropScale.toFixed(1)}x</span>
              </div>
              {/* Rotation */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-right text-xs text-slate-400">Rotate</span>
                <input type="range" min={-180} max={180} step={1} value={cropRotate}
                  onChange={(e) => setCropRotate(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white" />
                <span className="w-8 text-right text-xs text-slate-300">{cropRotate}°</span>
              </div>
              {/* Brightness */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-right text-xs text-slate-400">Brightness</span>
                <input type="range" min={0.3} max={2} step={0.01} value={cropBrightness}
                  onChange={(e) => setCropBrightness(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white" />
                <span className="w-8 text-right text-xs text-slate-300">{Math.round(cropBrightness * 100)}%</span>
              </div>
              {/* Contrast */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-right text-xs text-slate-400">Contrast</span>
                <input type="range" min={0.3} max={2} step={0.01} value={cropContrast}
                  onChange={(e) => setCropContrast(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white" />
                <span className="w-8 text-right text-xs text-slate-300">{Math.round(cropContrast * 100)}%</span>
              </div>
              {/* Saturation */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-right text-xs text-slate-400">Saturation</span>
                <input type="range" min={0} max={2} step={0.01} value={cropSaturate}
                  onChange={(e) => setCropSaturate(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white" />
                <span className="w-8 text-right text-xs text-slate-300">{Math.round(cropSaturate * 100)}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => setCropSrc(null)}
                className="flex-1 rounded-2xl border border-white/20 bg-white/10 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 rounded-2xl bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-95"
              >
                Crop &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ────────────────────────────────────────────────────────────── */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Personal Information
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={onLogout}
            className="rounded-2xl border-white/20 bg-white/10 px-5 py-6 text-slate-200 hover:bg-white/20"
          >
            <LogOut />
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10 lg:py-12">
        <section className="rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_32px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="relative mx-auto shrink-0 lg:mx-0">
              <div className="size-48 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-[0_25px_65px_rgba(15,23,42,0.18)]">
                <img
                  src={avatarSrc}
                  alt={sessionUser.name}
                  className="size-full object-cover"
                />
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload profile photo"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                title="Change profile photo"
                className="absolute bottom-2 right-2 flex size-14 cursor-pointer items-center justify-center rounded-full border border-white/90 bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-slate-50 hover:shadow-xl active:scale-95"
              >
                <Pencil className="size-5 text-slate-700" />
              </button>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                {sessionUser.name}
              </h2>

            </div>
          </div>

          <div className="mt-10 border-t border-white/10" />

          <div className="mt-10">
            <h3 className="text-3xl font-semibold tracking-tight text-white">
              Account Details
            </h3>
            <p className="mt-3 max-w-2xl text-base text-slate-400">
              Update your saved name and email to keep your account information
              current across the app.
            </p>
          </div>

          <form onSubmit={onSaveProfile} className="mt-8">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-8 lg:p-10">
              <div className="grid gap-6">
                <ProfileField
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={onFieldChange}
                />
                <ProfileField
                  label="Email Address"
                  name="email"
                  value={profileData.email}
                  onChange={onFieldChange}
                />

              </div>

              <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 rounded-2xl bg-slate-950 px-8 text-base text-white hover:bg-slate-800"
                >
                  {isLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  Save Changes
                </Button>


              </div>
            </div>
          </form>

          <div className="mt-6">
            <ProfileNotice status={status} />
          </div>
        </section>
      </main>
    </div>
  );
}

export function AuthUI({
  apiBaseUrl,
  signInContent = {},
  signUpContent = {},
  storageKey = "auth-session",
}: AuthUIProps) {
  const resolvedApiBaseUrl = useMemo(
    () =>
      (apiBaseUrl || import.meta.env.VITE_API_URL || "http://localhost:4000/api")
        .trim()
        .replace(/\/$/, ""),
    [apiBaseUrl],
  );

  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>(defaultStatus);
  const [session, setSession] = useState<AuthSession>(emptySession);
  const [signInData, setSignInData] = useState<SignInData>({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profileData, setProfileData] = useState<ProfileFormData>(emptyProfileForm);

  useEffect(() => {
    setSession(readStoredSession(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (!session.token) {
      window.localStorage.removeItem(storageKey);
      setProfileData(emptyProfileForm);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(session));
  }, [session, storageKey]);

  useEffect(() => {
    if (!session.user) {
      return;
    }

    setProfileData({
      name: session.user.name,
      email: session.user.email,
    });
  }, [session.user]);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };

  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;
  const isAuthenticated = Boolean(session.token && session.user);

  function handleSignInChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setSignInData((current) => ({ ...current, [name]: value }));
  }

  function handleSignUpChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setSignUpData((current) => ({ ...current, [name]: value }));
  }

  function handleProfileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setProfileData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggleForm() {
    setIsSignIn((current) => !current);
    setStatus(defaultStatus);
  }

  function resetForms() {
    setSignInData({
      email: "",
      password: "",
    });
    setSignUpData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  async function handleAuthRequest(endpoint: "login" | "signup", payload: object) {
    setIsLoading(true);
    setStatus({
      type: "info",
      text:
        endpoint === "login" ? "Signing you in..." : "Creating your account...",
    });

    try {
      const response = await fetch(`${resolvedApiBaseUrl}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.message || "Authentication failed.");
      }

      setSession({
        token: data.token,
        user: data.user,
      });
      setStatus(hiddenStatus);
      resetForms();
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not complete your request.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignInSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signInData.email.trim() || !signInData.password) {
      setStatus({
        type: "error",
        text: "Email and password are required.",
      });
      return;
    }

    await handleAuthRequest("login", {
      email: signInData.email.trim(),
      password: signInData.password,
    });
  }

  async function handleSignUpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !signUpData.name.trim() ||
      !signUpData.email.trim() ||
      !signUpData.password
    ) {
      setStatus({
        type: "error",
        text: "Name, email, and password are required.",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      setStatus({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setStatus({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    await handleAuthRequest("signup", {
      name: signUpData.name.trim(),
      email: signUpData.email.trim(),
      password: signUpData.password,
    });
  }

  async function refreshProfile() {
    if (!session.token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${resolvedApiBaseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Could not load your profile.");
      }

      setSession((current) => ({
        ...current,
        user: data.user ?? current.user,
      }));
      setStatus({
        type: "success",
        text: "Profile refreshed successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not refresh profile.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session.token) {
      return;
    }

    if (!profileData.name.trim() || !profileData.email.trim()) {
      setStatus({
        type: "error",
        text: "Name and email are required.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${resolvedApiBaseUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim(),
        }),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Could not save profile.");
      }

      setSession((current) => ({
        token: data.token ?? current.token,
        user: data.user ?? current.user,
      }));
      setStatus({
        type: "success",
        text: data.message || "Profile updated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not save profile.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    setSession(emptySession);
    setProfileData(emptyProfileForm);
    setStatus(hiddenStatus);
    setIsSignIn(true);
  }

  if (isAuthenticated && session.user) {
    return (
      <ProfilePage
        isLoading={isLoading}
        profileData={profileData}
        sessionUser={session.user}
        status={status}
        onFieldChange={handleProfileChange}
        onRefreshProfile={refreshProfile}
        onSaveProfile={handleProfileSave}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden">
      {/* fullscreen background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="/video.mp4"
      />
      {/* dark overlay so form text stays readable */}
      <div className="absolute inset-0 bg-black/30" />


      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wordCycle {
          0%,28%  { opacity:1; transform:translateY(0); }
          33%     { opacity:0; transform:translateY(-20px); }
          34%,61% { opacity:0; transform:translateY(20px); }
          66%,94% { opacity:1; transform:translateY(0); }
          99%     { opacity:0; transform:translateY(-20px); }
        }
        .hero-badge   { animation: fadeUp 0.7s ease both; }
        .hero-title   { animation: fadeUp 0.7s 0.15s ease both; }
        .hero-sub     { animation: fadeUp 0.7s 0.3s ease both; }
        .hero-cta     { animation: fadeUp 0.7s 0.45s ease both; }
      `}</style>

      {/* ── Layout wrapper ─────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full min-h-screen items-center">

        {/* Left — animated welcome text */}
        <div className="hidden md:flex flex-1 flex-col self-start justify-start pt-16 pl-12 lg:pl-24 pr-8 gap-6">
          <h1 className="hero-title text-5xl lg:text-7xl font-bold leading-tight drop-shadow-xl" style={{ color: "#FFF4E6", fontFamily: "'Poppins', sans-serif" }}>
            <Typewriter
              text={["You Again? Nice."]}
              speed={160}
              deleteSpeed={80}
              delay={2500}
              loop
              cursor=""
              className="block"
            />
          </h1>
        </div>

        {/* Right — glass login form */}
        <div className="flex w-full md:w-auto items-center justify-center md:justify-end pr-8 md:pr-16 lg:pr-24 py-10 pl-8 md:pl-0">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl p-8 md:p-10"
            style={{
              background: "rgba(255,255,255,0.01)",
              backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
              WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "0 8px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* top specular shine — bright edge like light hitting glass */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            {/* left edge catch-light */}
            <div className="pointer-events-none absolute inset-y-4 left-0 w-[1.5px] rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent" />
            {/* inner light bleed from top */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.07] via-transparent to-transparent" />
            <AuthFormContainer
              isLoading={isLoading}
              isSignIn={isSignIn}
              onToggle={toggleForm}
              signInData={signInData}
              signUpData={signUpData}
              status={status}
              onSignInChange={handleSignInChange}
              onSignUpChange={handleSignUpChange}
              onSignInSubmit={handleSignInSubmit}
              onSignUpSubmit={handleSignUpSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
