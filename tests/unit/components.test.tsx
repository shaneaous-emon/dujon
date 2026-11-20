// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import en from "../../messages/en.json";
import bn from "../../messages/bn.json";
import { Button, Field, Input, Select, fieldDescribedBy, buttonClasses } from "@/components/ui";

afterEach(cleanup);

function withIntl(ui: ReactNode, locale: "bn" | "en" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "bn" ? bn : en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("UI components", () => {
  it("Button defaults to type=button and marks loading as busy", () => {
    withIntl(<Button loading>{"Save"}</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("buttonClasses produces at least a 44px tall target (NFR-A11Y-002)", () => {
    expect(buttonClasses()).toContain("min-h-11");
  });

  it("Field links label, help and error to the control (NFR-A11Y-003)", () => {
    withIntl(
      <Field id="email" label="Email" required help="We never share it" error="Enter a valid email">
        <Input id="email" invalid aria-describedby={fieldDescribedBy("email", { help: 1, error: 1 })} />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("email-help email-error");
    expect(screen.getByText("(required)")).toBeTruthy();
  });

  it("Field shows the localized optional marker in Bangla", () => {
    withIntl(
      <Field id="m" label="মোবাইল" optional>
        <Input id="m" />
      </Field>,
      "bn",
    );
    expect(screen.getByText("(ঐচ্ছিক)")).toBeTruthy();
  });

  it("Select renders a placeholder option first", () => {
    withIntl(
      <Select
        aria-label="Division"
        placeholder="Select"
        options={[
          { value: "1", label: "Dhaka" },
          { value: "2", label: "Sylhet" },
        ]}
      />,
    );
    const options = screen.getAllByRole("option");
    expect(options[0]?.textContent).toBe("Select");
    expect(options).toHaveLength(3);
  });
});
