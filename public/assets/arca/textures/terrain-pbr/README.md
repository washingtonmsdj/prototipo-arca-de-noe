# Runtime terrain PBR maps

Locally packaged texture maps used by the browser scene. The terrain GLB does
not include UVs, so the runtime generates continuous world-planar UVs in metres
before applying these tileable materials.

- `grass_ground` — Grass Ground, Poly Haven, CC0; source surface size 2.5 m.
  Runtime: 2K diffuse + 1K OpenGL normal + 1K packed AO/Roughness/Metalness.
- `brown_mud_02` — Brown Mud 02, Poly Haven, CC0; source surface size 1.3 m.
  Runtime: 2K diffuse + 1K OpenGL normal + 1K packed AO/Roughness/Metalness.

Sources: <https://polyhaven.com/a/grass_ground> and
<https://polyhaven.com/a/brown_mud_02>. The game uses local copies and does not
contact Poly Haven at runtime. Color maps are interpreted as sRGB; normal and
packed data maps remain in linear/non-color space.
