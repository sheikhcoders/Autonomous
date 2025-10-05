import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MessageComposer } from "./MessageComposer";

describe("MessageComposer", () => {
  it("ignores Enter submissions while sending", () => {
    const handleSubmit = vi.fn();
    const { getByPlaceholderText } = render(
      <MessageComposer
        placeholder="Type your message"
        isSending={true}
        onSubmit={handleSubmit}
      />
    );

    const textarea = getByPlaceholderText("Type your message") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "Hello world" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(textarea.value).toBe("Hello world");
  });

  it("ignores form submissions while sending", () => {
    const handleSubmit = vi.fn();
    const { getByPlaceholderText } = render(
      <MessageComposer
        placeholder="Type another message"
        isSending={true}
        onSubmit={handleSubmit}
      />
    );

    const textarea = getByPlaceholderText("Type another message") as HTMLTextAreaElement;
    const form = textarea.closest("form");

    expect(form).not.toBeNull();

    fireEvent.change(textarea, { target: { value: "Queued message" } });
    fireEvent.submit(form!);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(textarea.value).toBe("Queued message");
  });
});
