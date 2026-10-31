import { screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it } from "vitest";
import { makeStore } from "@/store";
import { loadMe } from "@/store/authSlice";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import { hasActiveSession, useSessionState } from "@/hooks/useSessionState";

function Probe() {
  return <span data-testid="session">{useSessionState()}</span>;
}

describe("useSessionState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is unknown on the server, where stored tokens cannot be read", () => {
    localStorage.setItem("accessToken", "token");

    const html = renderToString(
      <Provider store={makeStore()}>
        <Probe />
      </Provider>,
    );

    expect(html).toContain("unknown");
  });

  it("is anonymous without stored tokens", () => {
    renderWithStore(<Probe />);

    expect(screen.getByTestId("session")).toHaveTextContent("anonymous");
  });

  it("is restoring while stored tokens are exchanged for a profile", () => {
    localStorage.setItem("refreshToken", "token");
    renderWithStore(<Probe />);

    expect(screen.getByTestId("session")).toHaveTextContent("restoring");
  });

  it("is authenticated once the user is loaded", () => {
    renderWithStore(<Probe />, { user: testStudent });

    expect(screen.getByTestId("session")).toHaveTextContent("authenticated");
  });

  it("is anonymous once the stored session has been rejected", () => {
    localStorage.setItem("accessToken", "expired");
    const store = makeStore();
    store.dispatch(loadMe.rejected(null, "test", undefined, "نشست منقضی شده است."));
    renderWithStore(<Probe />, { store });

    expect(screen.getByTestId("session")).toHaveTextContent("anonymous");
  });

  it("only allows private requests once credentials are known to exist", () => {
    expect(hasActiveSession("authenticated")).toBe(true);
    expect(hasActiveSession("restoring")).toBe(true);
    expect(hasActiveSession("unknown")).toBe(false);
    expect(hasActiveSession("anonymous")).toBe(false);
  });
});
