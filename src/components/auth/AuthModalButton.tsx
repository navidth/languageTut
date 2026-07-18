"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import {
  Alert,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import {
  authApi,
  CurrentLevel,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from "@/lib/auth";

type AuthMode = "login" | "register";

type AuthModalButtonProps = {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  pill?: boolean;
  fullWidth?: boolean;
  onOpened?: () => void;
};

const levels: CurrentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function getDashboardPath(role: UserRole) {
  if (role === "teacher") {
    return "/teacher";
  }

  return "/student";
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (error.response?.data && typeof error.response.data === "object") {
      return Object.entries(error.response.data)
        .map(
          ([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join("، ") : String(value)}`,
        )
        .join(" | ");
    }
  }

  return "خطایی رخ داد. لطفا دوباره تلاش کنید.";
}

export default function AuthModalButton({
  children = "ورود",
  className,
  color,
  pill = true,
  fullWidth,
  onOpened,
}: AuthModalButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>("A1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLogin = mode === "login";

  const handleOpen = () => {
    setOpen(true);
    setError("");
    setSuccess("");
    onOpened?.();
  };

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetMessages();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      if (isLogin) {
        const payload: LoginRequest = { email, password };
        const data = await authApi.login(payload);

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        setOpen(false);
        router.push(getDashboardPath(data.user.role));
        return;
      }

      const payload: RegisterRequest = {
        email,
        password,
        full_name: fullName,
        current_level: currentLevel,
      };

      await authApi.register(payload);
      setSuccess("ثبت نام با موفقیت انجام شد. حالا وارد حساب کاربری شوید.");
      setMode("login");
      setPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        color={color}
        pill={pill}
        className={className}
        fullSized={fullWidth}
        onClick={handleOpen}
      >
        {children}
      </Button>

      <Modal
        dismissible
        show={open}
        size="md"
        onClose={() => setOpen(false)}
        dir="rtl"
      >
        <ModalHeader className="justify-between">
          {isLogin ? "ورود به حساب کاربری" : "ثبت نام"}
        </ModalHeader>
        <ModalBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <Alert color="failure">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}

            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="mb-2 block">
                  نام و نام خانوادگی
                </Label>
                <TextInput
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required={!isLogin}
                  placeholder="نام کامل"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="mb-2 block">
                ایمیل
              </Label>
              <TextInput
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                رمز عبور
              </Label>
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={isLogin ? 1 : 8}
                placeholder={isLogin ? "رمز عبور" : "حداقل ۸ کاراکتر"}
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="currentLevel" className="mb-2 block">
                  سطح زبان
                </Label>
                <Select
                  id="currentLevel"
                  value={currentLevel}
                  onChange={(event) =>
                    setCurrentLevel(event.target.value as CurrentLevel)
                  }
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner size="sm" className="ml-2" />}
              {isLogin ? "ورود" : "ثبت نام"}
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
