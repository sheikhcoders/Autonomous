import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { MessageComposer } from "../MessageComposer";

describe("MessageComposer", () => {
  it("submits trimmed value when allowed", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <MessageComposer
        isSending={false}
        placeholder="Type here"
        onSubmit={handleSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText("Type here");
    await user.type(textarea, "Hello world");
    await user.keyboard("{Enter}");

    expect(handleSubmit).toHaveBeenCalledWith("Hello world");
  });

  it("blocks submit interactions while sending", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <MessageComposer
        isSending
        placeholder="Compose"
        onSubmit={handleSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText("Compose");
    await user.type(textarea, "Pending message");

    await user.keyboard("{Enter}");
    expect(handleSubmit).not.toHaveBeenCalled();

    const form = textarea.closest("form");
    expect(form).toBeTruthy();

    if (form) {
      fireEvent.submit(form);
    }

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
