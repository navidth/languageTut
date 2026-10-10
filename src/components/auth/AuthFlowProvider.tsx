"use client";

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasStoredSession as hasSavedSession } from "@/lib/apiClient";
import type { User } from "@/lib/auth";
import {
  type AuthIntent,
  type AuthenticationMode,
  resolvePostAuthenticationFlow,
} from "@/lib/authFlow";
import { PLACEMENT_SECTION_ID, ROUTES } from "@/lib/routes";
import { fetchAuthFeatures, loadMe } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const loadAuthenticationModal = () => import("./AuthenticationModal");
// The modal is only downloaded once it is needed, so pages for signed-in
// users do not carry it.
const AuthenticationModal = lazy(loadAuthenticationModal);

type AuthFlowContextValue = {
  startAuthFlow: (intent?: AuthIntent) => Promise<void>;
  busy: boolean;
};

const AuthFlowContext = createContext<AuthFlowContextValue | null>(null);

export default function AuthFlowProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { error: authError, status, user } = useAppSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  // Stays true after the first open, so closing can still animate.
  const [modalMounted, setModalMounted] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("learning");
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const queuedIntentRef = useRef<AuthIntent | null>(null);
  const navigationStartedRef = useRef(false);

  useEffect(() => {
    navigationStartedRef.current = false;
  }, [pathname]);

  // Visitors without a session are the ones likely to sign in, so fetch the
  // modal and the account features that shape it in the background once the
  // page has settled.
  useEffect(() => {
    if (hasSavedSession()) return;
    const preload = () => {
      void loadAuthenticationModal();
      void dispatch(fetchAuthFeatures());
    };
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(preload);
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(preload, 2000);
    return () => window.clearTimeout(timer);
  }, [dispatch]);

  const openModal = useCallback(() => {
    setModalMounted(true);
    setModalOpen(true);
  }, []);

  const continueFlow = useCallback((
    latestUser: User,
    requestedIntent: AuthIntent,
    authenticationMode: AuthenticationMode = "login",
  ) => {
    if (navigationStartedRef.current) return;
    const nextAction = resolvePostAuthenticationFlow(
      latestUser,
      requestedIntent,
      authenticationMode,
    );

    if (nextAction.type === "navigate") {
      navigationStartedRef.current = true;
      router.push(nextAction.href);
      return;
    }

    if (pathname !== ROUTES.home) {
      navigationStartedRef.current = true;
      router.push(`${ROUTES.home}#${PLACEMENT_SECTION_ID}`);
      return;
    }

    const section = document.getElementById(PLACEMENT_SECTION_ID);
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() => {
      section.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      section.focus({ preventScroll: true });
    });
  }, [pathname, router]);

  useEffect(() => {
    const queuedIntent = queuedIntentRef.current;
    if (!queuedIntent) return;

    if (status === "authenticated" && user) {
      queuedIntentRef.current = null;
      queueMicrotask(() => {
        setCheckingProfile(false);
        continueFlow(user, queuedIntent);
      });
    } else if (status === "error") {
      queuedIntentRef.current = null;
      queueMicrotask(() => {
        setCheckingProfile(false);
        setIntent(queuedIntent);
        setProfileError(authError ?? "دریافت آخرین اطلاعات پروفایل ناموفق بود. لطفاً دوباره وارد شوید.");
        openModal();
      });
    }
  }, [authError, continueFlow, openModal, status, user]);

  const startAuthFlow = useCallback(async (requestedIntent: AuthIntent = "learning") => {
    if (checkingProfile || modalOpen) return;
    setProfileError("");
    setIntent(requestedIntent);

    if (status === "authenticated" && user) {
      continueFlow(user, requestedIntent);
      return;
    }

    if (status === "loading") {
      queuedIntentRef.current = requestedIntent;
      setCheckingProfile(true);
      return;
    }

    const hasStoredSession = Boolean(
      localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"),
    );

    if (!hasStoredSession) {
      openModal();
      return;
    }

    queuedIntentRef.current = requestedIntent;
    setCheckingProfile(true);
    void dispatch(loadMe()).unwrap().catch(() => undefined);
  }, [checkingProfile, continueFlow, dispatch, modalOpen, openModal, status, user]);

  const handleAuthenticated = useCallback((
    latestUser: User,
    authenticationMode: AuthenticationMode,
  ) => {
    setModalOpen(false);
    setProfileError("");
    continueFlow(latestUser, intent, authenticationMode);
  }, [continueFlow, intent]);

  const value = useMemo<AuthFlowContextValue>(() => ({
    startAuthFlow,
    busy: checkingProfile || status === "loading",
  }), [checkingProfile, startAuthFlow, status]);

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
      {modalMounted && (
        <Suspense fallback={null}>
          <AuthenticationModal
            open={modalOpen}
            profileError={profileError}
            onClose={() => {
              setModalOpen(false);
              setProfileError("");
            }}
            onAuthenticated={handleAuthenticated}
          />
        </Suspense>
      )}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const context = useContext(AuthFlowContext);
  if (!context) {
    throw new Error("useAuthFlow must be used inside AuthFlowProvider.");
  }
  return context;
}
