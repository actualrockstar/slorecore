import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { ASSET_MANIFEST } from '../config/assetManifest';
import { Perspective } from '../utils/Perspective';

export class ScrollManager {
  private scene: Phaser.Scene;
  private roadGraphics: Phaser.GameObjects.Graphics;
  private skylineGraphics: Phaser.GameObjects.Graphics;
  private roadMesh?: Phaser.GameObjects.Mesh;
  private leftBuilding?: Phaser.GameObjects.Image;
  private rightBuilding?: Phaser.GameObjects.Image;
  private scrollOffset: number = 0;

  // Per Phaser's own Mesh.addVertices doc example: calling `setOrtho(mesh.width, mesh.height)`
  // (the mesh's own texture-derived size, NOT our design size) makes Vertex.transformCoordinatesLocal
  // project x 1:1 to pixels (the mesh.width factor cancels out algebraically). Y has a sign flip
  // baked into that same method (`vy = -(ty/tw) * height`) that X does not have, so every Y value
  // fed into a mesh must be negated to compensate.
  private static toMeshX(x: number): number {
    return x;
  }

  private static toMeshY(y: number): number {
    return -y;
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const w = GAME_CONFIG.DESIGN_WIDTH;
    const horizon = GAME_CONFIG.PERSPECTIVE.HORIZON_Y;
    const { toMeshX, toMeshY } = ScrollManager;

    // Sky / Background (Depth 0)
    const sky = scene.add.rectangle(w / 2, horizon / 2, w, horizon, 0x1a1a3a);
    sky.setDepth(0);

    // NYC Skyline / Buildings (Depth 10)
    this.skylineGraphics = scene.add.graphics();
    this.skylineGraphics.setDepth(10);

    if (scene.textures.exists(ASSET_MANIFEST.skyline.key)) {
      const skylineImage = scene.add.image(w / 2, horizon, ASSET_MANIFEST.skyline.key);
      skylineImage.setOrigin(0.5, 1);
      skylineImage.setDepth(10);
      skylineImage.setDisplaySize(w, horizon);
    } else {
      this.drawSkyline();
    }

    // Road & Sidewalk graphics (Depth 20)
    this.roadGraphics = scene.add.graphics();
    this.roadGraphics.setDepth(20);

    // Perspective Road Mesh (Depth 22)
    if (scene.textures.exists(ASSET_MANIFEST.road.key)) {
      this.roadMesh = scene.add.mesh(0, 0, ASSET_MANIFEST.road.key);
      // Use the mesh's OWN width/height (texture-derived), not our design size —
      // see the comment on ScrollManager.toMeshX/toMeshY for why.
      this.roadMesh.setOrtho(this.roadMesh.width, this.roadMesh.height);
      this.roadMesh.hideCCW = false;
      this.roadMesh.setDepth(22);

      // Build the road quad's geometry ONCE here (it never changes shape). Rebuilding it
      // every frame from update() would race Phaser's own per-frame order: the update list's
      // preUpdate (which transforms mesh vertices into screen positions) runs BEFORE the
      // Scene's own update() — so freshly rebuilt faces are always one frame behind and never
      // get transformed before being discarded again, making the mesh permanently invisible.
      // Texture scrolling is instead animated afterward via Mesh#uvScroll, which only mutates
      // UVs on the existing faces.
      //
      // The road trapezoid is sliced into many thin horizontal strips rather than built as one
      // big 2-triangle quad. With setOrtho (no real depth), the GPU linearly interpolates UVs
      // across each triangle instead of perspective-correcting them — fine for a rectangle, but
      // a single wide trapezoid warps visibly (the classic affine-texture-mapping artifact from
      // old pseudo-3D racers). Thin strips are each nearly rectangular, so the distortion per
      // strip becomes negligible.
      const ROAD_STRIPS = 40;
      const roadVertices: number[] = [];
      const roadUvs: number[] = [];

      // Perspective.project uses curve = z*z (non-linear), so evenly-spaced z steps produce
      // strips that grow rapidly toward the bottom of the road — right where the trapezoid
      // widens fastest and warping is worst. Sampling z as sqrt(t) instead spaces the strips
      // evenly across the actual on-screen width/depth change, not evenly across raw z.
      for (let i = 0; i < ROAD_STRIPS; i++) {
        const z0 = Math.sqrt(i / ROAD_STRIPS);
        const z1 = Math.sqrt((i + 1) / ROAD_STRIPS);

        const pL0 = Perspective.project(-1, z0);
        const pR0 = Perspective.project(3, z0);
        const pL1 = Perspective.project(-1, z1);
        const pR1 = Perspective.project(3, z1);

        const v0 = z0 * 3;
        const v1 = z1 * 3;

        roadVertices.push(
          toMeshX(pL0.x), toMeshY(pL0.y),
          toMeshX(pR0.x), toMeshY(pR0.y),
          toMeshX(pL1.x), toMeshY(pL1.y),
          toMeshX(pR0.x), toMeshY(pR0.y),
          toMeshX(pR1.x), toMeshY(pR1.y),
          toMeshX(pL1.x), toMeshY(pL1.y),
        );
        roadUvs.push(
          0, v0,
          1, v0,
          0, v1,
          1, v0,
          1, v1,
          0, v1,
        );
      }

      this.roadMesh.addVertices(roadVertices, roadUvs);
    }

    // Custom Building Assets (Left & Right) — plain images hugging the screen edges (Depth 25).
    const pTR = Perspective.project(2, 0);

    if (scene.textures.exists(ASSET_MANIFEST.building_left.key)) {
      this.leftBuilding = scene.add.image(0, horizon + 400, ASSET_MANIFEST.building_left.key);
      this.leftBuilding.setOrigin(0, 1);
      this.leftBuilding.setDepth(25);
      // Fixed width, independently adjustable height
      const targetWidth = 275;
      const targetHeight = 460;
      this.leftBuilding.setDisplaySize(targetWidth, targetHeight);
    }

    if (scene.textures.exists(ASSET_MANIFEST.building_right.key)) {
      this.rightBuilding = scene.add.image(w, horizon + 450, ASSET_MANIFEST.building_right.key);
      this.rightBuilding.setOrigin(1, 1);
      this.rightBuilding.setDepth(25);
      // Fixed width, independently adjustable height
      const targetWidth = 300;
      const targetHeight = 550;
      this.rightBuilding.setDisplaySize(targetWidth, targetHeight);
    }
  }

  private drawSkyline() {
    this.skylineGraphics.clear();
    this.skylineGraphics.fillStyle(0x0a0a2a, 1);
    
    const horizon = GAME_CONFIG.PERSPECTIVE.HORIZON_Y;
    
    // Silhouette buildings along horizon
    this.skylineGraphics.fillRect(5, horizon - 150, 45, 150);
    this.skylineGraphics.fillRect(55, horizon - 200, 65, 200);
    this.skylineGraphics.fillRect(130, horizon - 110, 55, 110);
    this.skylineGraphics.fillRect(190, horizon - 220, 75, 220);
    this.skylineGraphics.fillRect(270, horizon - 170, 55, 170);
    this.skylineGraphics.fillRect(330, horizon - 130, 45, 130);
  }

  update(speed: number) {
    const w = GAME_CONFIG.DESIGN_WIDTH;
    const h = GAME_CONFIG.DESIGN_HEIGHT;
    const horizon = GAME_CONFIG.PERSPECTIVE.HORIZON_Y;

    // Accumulate scroll
    const deltaZ = (speed / GAME_CONFIG.DESIGN_HEIGHT) * 0.016; 
    this.scrollOffset = (this.scrollOffset + deltaZ) % 1.0;

    // Projected road trapezoid coordinates
    const pTL = Perspective.project(-1, 0); // horizon left
    const pTR = Perspective.project(3, 0);  // horizon right
    const pBL = Perspective.project(-1, 1); // bottom left
    const pBR = Perspective.project(3, 1);  // bottom right

    // Clear graphics and draw background grass/sidewalk base
    this.roadGraphics.clear();

    // Grass / Off-road ground
    this.roadGraphics.fillStyle(0x1a3a1a, 1);
    this.roadGraphics.fillRect(0, horizon, w, h - horizon);

    // Dark base road trapezoid (fallback if mesh isn't active)
    this.roadGraphics.fillStyle(0x2a2a2a, 1);
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(pTL.x, pTL.y);
    this.roadGraphics.lineTo(pTR.x, pTR.y);
    this.roadGraphics.lineTo(pBR.x, pBR.y);
    this.roadGraphics.lineTo(pBL.x, pBL.y);
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();

    // Animate the road texture scroll by nudging UVs on the mesh's existing faces
    // (built once in the constructor) — see the comment there for why we don't
    // rebuild the mesh's geometry every frame.
    if (this.roadMesh) {
      this.roadMesh.uvScroll(0, -deltaZ);
    }

    // Perspective grid lines (lane dividers)
    this.roadGraphics.lineStyle(3, 0xffffff, 0.9);
    
    const drawDashedLaneLine = (laneFloat: number) => {
      let drawing = false;
      for (let z = 0; z <= 1; z += 0.01) {
        const shiftedZ = z - (this.scrollOffset % 0.2);
        const wrapZ = shiftedZ < 0 ? shiftedZ + 1 : shiftedZ;
        const isDash = (wrapZ % 0.2) < 0.1;
        
        const p = Perspective.project(laneFloat, z);
        
        if (isDash && !drawing) {
          this.roadGraphics.moveTo(p.x, p.y);
          drawing = true;
        } else if (isDash && drawing) {
          this.roadGraphics.lineTo(p.x, p.y);
        } else if (!isDash && drawing) {
          drawing = false;
        }
      }
    };

    this.roadGraphics.beginPath();
    drawDashedLaneLine(0.5);
    drawDashedLaneLine(1.5);
    this.roadGraphics.strokePath();
  }
}
