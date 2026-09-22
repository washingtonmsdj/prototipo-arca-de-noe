export interface ActorMotionState {
  phase: number
  x: number
  y: number
  z: number
  heading: number
  moving: boolean
  slopeX: number
  slopeZ: number
}

export interface ActorMotionRef {
  current: ActorMotionState
}

export function actorMotionState(
  x: number,
  y: number,
  z: number,
): ActorMotionState {
  return {
    phase: 0,
    x,
    y,
    z,
    heading: 0,
    moving: false,
    slopeX: 0,
    slopeZ: 0,
  }
}
