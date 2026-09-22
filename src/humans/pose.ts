import type { HumanClip, HumanPose } from "./types"

export function humanPose(clip: HumanClip, phase: number): HumanPose {
  const t = phase * Math.PI * 2
  const walkSwing = Math.sin(t)

  if (clip === "carry") {
    return {
      bodyY: Math.sin(t * 2) * .012,
      bodyPitch: -.05,
      bodyRoll: 0,
      leftArm: [-.72, -.28],
      rightArm: [-.72, .28],
      headPitch: .03,
    }
  }

  if (clip === "pray") {
    return {
      bodyY: 0,
      bodyPitch: .08,
      bodyRoll: 0,
      leftArm: [-1.18, -.16],
      rightArm: [-1.18, .16],
      headPitch: .16,
    }
  }

  if (clip === "build") {
    const swing = Math.sin(t)
    return {
      bodyY: Math.max(0, Math.sin(t * 2)) * .01,
      bodyPitch: -.08,
      bodyRoll: swing * .035,
      leftArm: [-1.08 + swing * .38, -.38],
      rightArm: [-1.05 + swing * .48, .38],
      headPitch: -.03,
    }
  }

  if (clip === "gather") {
    const bend = .22 + (1 + Math.sin(t)) * .08
    return {
      bodyY: -.04,
      bodyPitch: bend,
      bodyRoll: 0,
      leftArm: [-.95, -.18],
      rightArm: [-.95, .18],
      headPitch: .10,
    }
  }

  if (clip === "walk") {
    return {
      bodyY: Math.sin(t * 2) * .018,
      bodyPitch: Math.sin(t + Math.PI / 2) * .025,
      bodyRoll: Math.sin(t) * .018,
      leftArm: [walkSwing * .65, 0],
      rightArm: [-walkSwing * .65, 0],
      headPitch: Math.sin(t * 2) * .02,
    }
  }

  return {
    bodyY: Math.sin(t * .5) * .006,
    bodyPitch: 0,
    bodyRoll: 0,
    leftArm: [0, 0],
    rightArm: [0, 0],
    headPitch: Math.sin(t * .35) * .018,
  }
}
