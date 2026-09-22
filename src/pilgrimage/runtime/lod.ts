export type LabRepresentation = "rig" | "sprite" | "auto"
export type ActiveRepresentation = Exclude<LabRepresentation, "auto">

export interface LodPolicy {
  switchDistance: number
  hysteresis: number
}

export const DEFAULT_LOD_POLICY: LodPolicy = {
  switchDistance: 14,
  hysteresis: 1.5,
}

export function lodRepresentation(
  current: ActiveRepresentation,
  distance: number,
  policy: LodPolicy = DEFAULT_LOD_POLICY,
): ActiveRepresentation {
  const near = Math.max(0, policy.switchDistance - policy.hysteresis)
  const far = policy.switchDistance + policy.hysteresis

  if (current === "rig" && distance > far) return "sprite"
  if (current === "sprite" && distance < near) return "rig"
  return current
}
