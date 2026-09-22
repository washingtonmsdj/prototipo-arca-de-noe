import { describe, expect, it } from "vitest"
import {
  DEFAULT_LOD_POLICY,
  lodRepresentation,
} from "./lod"

describe("actor LOD policy", () => {
  it("switches to sprites only beyond the far hysteresis boundary", () => {
    const { switchDistance, hysteresis } = DEFAULT_LOD_POLICY
    expect(lodRepresentation("rig", switchDistance + hysteresis - .01)).toBe("rig")
    expect(lodRepresentation("rig", switchDistance + hysteresis + .01)).toBe("sprite")
  })

  it("switches back to the rig only inside the near boundary", () => {
    const { switchDistance, hysteresis } = DEFAULT_LOD_POLICY
    expect(lodRepresentation("sprite", switchDistance - hysteresis + .01)).toBe("sprite")
    expect(lodRepresentation("sprite", switchDistance - hysteresis - .01)).toBe("rig")
  })

  it("does not flap inside the hysteresis band", () => {
    expect(lodRepresentation("rig", DEFAULT_LOD_POLICY.switchDistance)).toBe("rig")
    expect(lodRepresentation("sprite", DEFAULT_LOD_POLICY.switchDistance)).toBe("sprite")
  })
})
