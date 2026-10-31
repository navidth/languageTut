import type { CurrentLevel } from "@/types/level";
import type { User, UserRole } from "@/types/auth";
import { ROUTES } from "@/constants/routes";
import type { AuthIntent, AuthenticationMode } from "@/types/auth";
import { CEFR_LEVELS } from "@/constants/levels";

const VALID_LEVELS = new Set<CurrentLevel>(CEFR_LEVELS);

function hasValidPlacementLevel(user: User) {
  return Boolean(
    user.current_level && VALID_LEVELS.has(user.current_level),
  );
}

export function dashboardRouteForRole(role: UserRole) {
  return role === "teacher" ? ROUTES.teacherDashboard : ROUTES.studentDashboard;
}

export function resolveAuthFlow(user: User, intent: AuthIntent) {
  if (intent === "placement") {
    return { type: "navigate", href: ROUTES.placementTest } as const;
  }

  if (hasValidPlacementLevel(user)) {
    return {
      type: "navigate",
      href: dashboardRouteForRole(user.role),
    } as const;
  }

  return { type: "placement-section" } as const;
}

export function resolvePostAuthenticationFlow(
  user: User,
  intent: AuthIntent,
  authenticationMode: AuthenticationMode,
) {
  if (authenticationMode === "signup") {
    return { type: "placement-section" } as const;
  }

  return resolveAuthFlow(user, intent);
}
