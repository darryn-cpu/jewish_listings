export function receiptEmail(input: { refCode: string; statusUrl: string }) {
  return {
    subject: `Application received ${input.refCode}`,
    text: [
      "Foundation 2000 has received your Jewish Business Directory application.",
      "",
      `Reference: ${input.refCode}`,
      "Status: pending review",
      "",
      "Keep this link private. It is the only way to check the application without an account:",
      input.statusUrl,
      "",
      "The directory covers Johannesburg and Cape Town. A reviewer will write if more information is needed.",
    ].join("\n"),
  }
}

export function requiresInfoEmail(input: { refCode: string; message: string; statusUrl: string }) {
  return {
    subject: `More information needed for ${input.refCode}`,
    text: [
      `A reviewer needs more information before ${input.refCode} can continue.`,
      "",
      input.message.trim(),
      "",
      "Use the private status link from your receipt email:",
      input.statusUrl,
    ].join("\n"),
  }
}
