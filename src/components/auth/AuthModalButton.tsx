"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Label, Modal, ModalBody, ModalHeader, Select, Spinner, TextInput } from "flowbite-react";
import { CurrentLevel, UserRole } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { login, register } from "@/store/authSlice";

type AuthMode = "login" | "register" | "forgot";
type Props = {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  pill?: boolean;
  fullWidth?: boolean;
  onOpened?: () => void;
};

const levels: CurrentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const dashboardPath = (role: UserRole) => role === "teacher" ? "/teacher" : "/student";

export default function AuthModalButton({
  children = "ورود",
  className,
  color,
  pill = true,
  fullWidth,
  onOpened,
}: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>("A1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (next: AuthMode) => { setMode(next); setError(""); };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "forgot") return;
    setLoading(true);
    setError("");
    try {
      const action = mode === "login"
        ? await dispatch(login({ email, password })).unwrap()
        : await dispatch(register({ email, password, full_name: fullName, current_level: currentLevel })).unwrap();
      setOpen(false);
      router.push(dashboardPath(action.role));
    } catch (reason) {
      setError(String(reason));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color={color} pill={pill} className={className} fullSized={fullWidth} onClick={() => { setOpen(true); setError(""); onOpened?.(); }}>
        {children}
      </Button>
      <Modal dismissible show={open} size="md" onClose={() => setOpen(false)} dir="rtl">
        <ModalHeader>
          {mode === "login" ? "ورود به حساب کاربری" : mode === "register" ? "ساخت حساب کاربری" : "بازیابی رمز عبور"}
        </ModalHeader>
        <ModalBody>
          {mode === "forgot" ? (
            <div className="space-y-4">
              <Alert color="warning">سرویس بازیابی رمز عبور هنوز در API سرور ارائه نشده است. پس از اضافه‌شدن endpoint، این فرم فعال می‌شود.</Alert>
              <Button color="light" className="w-full" onClick={() => switchMode("login")}>بازگشت به ورود</Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && <Alert color="failure">{error}</Alert>}
              {mode === "register" && (
                <div><Label htmlFor="fullName" className="mb-2 block">نام و نام خانوادگی</Label><TextInput id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              )}
              <div><Label htmlFor="email" className="mb-2 block">ایمیل</Label><TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" autoComplete="email" /></div>
              <div><Label htmlFor="password" className="mb-2 block">رمز عبور</Label><TextInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
              {mode === "register" && (
                <div><Label htmlFor="level" className="mb-2 block">سطح زبان</Label><Select id="level" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value as CurrentLevel)}>{levels.map((level) => <option key={level}>{level}</option>)}</Select></div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>{loading && <Spinner size="sm" className="ml-2" />}{mode === "login" ? "ورود" : "ثبت‌نام و ورود"}</Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="text-blue-600" onClick={() => switchMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "ساخت حساب" : "حساب دارم"}</button>
                {mode === "login" && <button type="button" className="text-blue-600" onClick={() => switchMode("forgot")}>رمز عبور را فراموش کرده‌ام</button>}
              </div>
            </form>
          )}
        </ModalBody>
      </Modal>
    </>
  );
}
