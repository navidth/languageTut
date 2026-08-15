import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("builds crawlable links and preserves existing query values", () => {
    render(
      <Pagination
        currentPage={2}
        count={50}
        resultsCount={10}
        next="http://api.test/items?page=3"
        previous="http://api.test/items?page=1"
        basePath="/courses"
        query={{ search: "ielts", tags: ["audio", "video"] }}
      />,
    );

    expect(screen.getByRole("link", { name: "صفحه بعد" })).toHaveAttribute(
      "href",
      "/courses?search=ielts&tags=audio&tags=video&page=3",
    );
    expect(screen.getByRole("link", { name: "صفحه قبل" })).toHaveAttribute(
      "href",
      "/courses?search=ielts&tags=audio&tags=video",
    );
    expect(screen.getByRole("button", { name: "صفحه ۲" })).toHaveAttribute("aria-current", "page");
  });

  it("calls the client-side page handler", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        count={25}
        resultsCount={10}
        next="http://api.test/items?page=2"
        previous={null}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "صفحه بعد" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeDisabled();
  });

  it("does not render for a single-page result", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        count={4}
        resultsCount={4}
        next={null}
        previous={null}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
