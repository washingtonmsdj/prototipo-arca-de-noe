import * as THREE from "three"
import type { SocketName } from "../../vendor/pilgrimage/lib/game/base-person/pose"

export const HUMAN_ATTACHMENTS = [
  { id: "hammer", label: "Martelo de teste", defaultSocket: "rightHand" },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  defaultSocket: SocketName
}>

export type HumanAttachmentKind = typeof HUMAN_ATTACHMENTS[number]["id"]

export interface HumanAttachmentInstance {
  group: THREE.Group
  dispose: () => void
}

export function createHumanAttachment(kind: HumanAttachmentKind): HumanAttachmentInstance {
  switch (kind) {
    case "hammer": {
      const group = new THREE.Group()
      group.name = "attachment-hammer"

      const material = new THREE.MeshStandardMaterial({
        color: "#d9a852",
        roughness: .72,
        metalness: .03,
      })
      const handleGeometry = new THREE.CylinderGeometry(.018, .022, .32, 8)
      const headGeometry = new THREE.BoxGeometry(.11, .06, .08)
      const handle = new THREE.Mesh(handleGeometry, material)
      const head = new THREE.Mesh(headGeometry, material)

      handle.rotation.z = Math.PI / 2
      handle.position.x = .12
      head.position.x = .28
      group.add(handle, head)

      return {
        group,
        dispose() {
          group.removeFromParent()
          handleGeometry.dispose()
          headGeometry.dispose()
          material.dispose()
        },
      }
    }
  }
}

export function humanAttachmentLabel(kind: HumanAttachmentKind) {
  return HUMAN_ATTACHMENTS.find((entry) => entry.id === kind)?.label ?? kind
}
