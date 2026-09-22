function EdgeGuard({ x, y, z, span, cross = false }: {
  x: number; y: number; z: number; span: number; cross?: boolean
}) {
  const segments = Math.ceil(span / 2)
  return <group position={[x, y, z]} rotation={[0, cross ? Math.PI / 2 : 0, 0]}>
    {[0.12, 0.55, 1.1].map(level => <mesh key={level} name="Opening_Guardrail"
      position={[0, level, 0]} castShadow receiveShadow>
      <boxGeometry args={[span, 0.14, 0.14]} />
      <meshStandardMaterial color="#795333" roughness={0.9} />
    </mesh>)}
    {Array.from({ length: segments + 1 }, (_, i) => <mesh key={i}
      name="Opening_Guardrail_Post" position={[-span / 2 + i * span / segments, 0.6, 0]} castShadow>
      <boxGeometry args={[0.16, 1.2, 0.16]} />
      <meshStandardMaterial color="#795333" roughness={0.9} />
    </mesh>)}
    <mesh name="Opening_Guardrail_Collider" position={[0, 0.6, 0]} userData={{ colliderOnly: true }}>
      <boxGeometry args={[span, 1.2, 0.16]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  </group>
}

export function RampAccess() {
  return <group name="Ramp_Access_Runtime">
    {/* Continuous exterior support; no duplicate exterior railings. */}
    <mesh name="Ramp_Walkable" position={[-55, 2.25, 31.55]}
      rotation={[-Math.PI / 2 + Math.atan(5.2 / 40), 0, 0]} userData={{ walkable: true, colliderOnly: true }}>
      <planeGeometry args={[8, Math.hypot(40, 5.2)]} />
      <meshBasicMaterial visible={false} />
    </mesh>
    {/* Actual GLB openings: [-48,-13] and [8,43], width 4.5m.
        Guard the upper floor, leaving the high end open for ramp arrival. */}
    {[{ start: -48, y: 4.85 }, { start: 8, y: 9.05 }].map(({ start, y }) =>
      <group key={start}>
        {[-2.3, 2.3].map(z => <EdgeGuard key={z} x={start + 17.5} y={y} z={z} span={35} />)}
        <EdgeGuard x={start - 0.08} y={y} z={0} span={4.6} cross />
      </group>)}
  </group>
}
