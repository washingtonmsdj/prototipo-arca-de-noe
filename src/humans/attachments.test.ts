import { describe, expect, it } from "vitest"
import { createHumanAttachment, HUMAN_ATTACHMENTS } from "./attachments"

describe("human attachments", () => {
  it("keeps attachment definitions explicit and socket-aware", () => {
    expect(HUMAN_ATTACHMENTS).toEqual([
      { id: "hammer", label: "Martelo de teste", defaultSocket: "rightHand" },
    ])
  })

  it("creates a reusable finite Three.js attachment", () => {
    const attachment = createHumanAttachment("hammer")
    try {
      expect(attachment.group.name).toBe("attachment-hammer")
      expect(attachment.group.children).toHaveLength(2)
      attachment.group.updateMatrixWorld(true)
      for (const child of attachment.group.children) {
        expect(child.matrixWorld.elements.every(Number.isFinite)).toBe(true)
      }
    } finally {
      attachment.dispose()
    }
  })
})
