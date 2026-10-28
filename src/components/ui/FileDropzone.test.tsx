import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import FileDropzone from "./FileDropzone";

function Harness({ disabled = false, onChange = vi.fn() }: { disabled?: boolean; onChange?: (file: File | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
      <p id="dz-label">فایل پاسخ</p>
      <FileDropzone
        id="dz"
        file={file}
        disabled={disabled}
        aria-labelledby="dz-label"
        hint="یک فایل انتخاب کنید."
        onFileChange={(next) => {
          setFile(next);
          onChange(next);
        }}
      />
    </>
  );
}

function dropArea() {
  return document.querySelector("label[for='dz']") as HTMLLabelElement;
}

function dataTransfer(files: File[]) {
  return { files, types: ["Files"], dropEffect: "none" };
}

describe("FileDropzone", () => {
  it("takes a file from the picker and shows its name and size", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const file = new File(["hello"], "answer.pdf", { type: "application/pdf" });

    expect(screen.getByText("یک فایل انتخاب کنید.")).toBeInTheDocument();
    await user.upload(screen.getByLabelText("فایل پاسخ"), file);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByText("answer.pdf")).toBeInTheDocument();
    expect(screen.getByText(/برای تغییر، فایل دیگری انتخاب کنید/)).toBeInTheDocument();
  });

  it("takes a dropped file and highlights the area while dragging", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const file = new File(["x"], "essay.docx");

    fireEvent.dragEnter(dropArea(), { dataTransfer: dataTransfer([file]) });
    expect(dropArea()).toHaveAttribute("data-dragging", "true");
    expect(screen.getByText("فایل را رها کنید")).toBeInTheDocument();

    fireEvent.drop(dropArea(), { dataTransfer: dataTransfer([file]) });
    expect(dropArea()).not.toHaveAttribute("data-dragging");
    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByText("essay.docx")).toBeInTheDocument();
  });

  it("ignores drops while disabled", () => {
    const onChange = vi.fn();
    render(<Harness disabled onChange={onChange} />);

    fireEvent.dragEnter(dropArea(), { dataTransfer: dataTransfer([new File(["x"], "a.txt")]) });
    fireEvent.drop(dropArea(), { dataTransfer: dataTransfer([new File(["x"], "a.txt")]) });

    expect(dropArea()).not.toHaveAttribute("data-dragging");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("فایل پاسخ")).toBeDisabled();
  });

  it("marks the input invalid for assistive technology", () => {
    render(<FileDropzone id="dz" file={null} onFileChange={vi.fn()} invalid aria-label="فایل" />);

    expect(screen.getByLabelText("فایل")).toBeInvalid();
  });
});
