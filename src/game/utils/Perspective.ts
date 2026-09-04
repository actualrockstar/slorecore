import { GAME_CONFIG } from '../config/gameConfig';

export class Perspective {
  /**
   * Projects a 3D coordinate (lane, z) onto the 2D screen.
   * @param lane 0 (left), 1 (center), or 2 (right)
   * @param z Depth from 0.0 (horizon) to 1.0 (bottom of screen)
   */
  static project(lane: number, z: number) {
    const { 
      HORIZON_Y, 
      BOTTOM_Y, 
      HORIZON_ROAD_WIDTH, 
      BOTTOM_ROAD_WIDTH,
      HORIZON_SCALE,
      BOTTOM_SCALE
    } = GAME_CONFIG.PERSPECTIVE;

    // Apply a simple curve to z to make depth feel non-linear (things come at you faster as they get closer)
    const curve = z * z; 

    const y = HORIZON_Y + (BOTTOM_Y - HORIZON_Y) * curve;
    const roadWidthAtZ = HORIZON_ROAD_WIDTH + (BOTTOM_ROAD_WIDTH - HORIZON_ROAD_WIDTH) * curve;
    
    // Lane offset: -0.33 for left, 0 for center, 0.33 for right
    // Actually if lane is 0,1,2: 
    // lane - 1 = -1, 0, 1
    // Ratio = (lane - 1) * (1/3)
    const laneOffsetRatio = (lane - 1) * 0.333333;
    
    const x = (GAME_CONFIG.DESIGN_WIDTH / 2) + (roadWidthAtZ * laneOffsetRatio);
    const scale = HORIZON_SCALE + (BOTTOM_SCALE - HORIZON_SCALE) * curve;

    return { x, y, scale };
  }
}
