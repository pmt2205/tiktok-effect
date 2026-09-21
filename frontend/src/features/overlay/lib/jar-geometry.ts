export interface JarLayerAssets {
  back: string;
  front: string;
  middleMask?: string;
  colorized: boolean;
  scale: number;
}

interface JarWallProfile {
  neckY: number;
  transitionEndY: number;
  neckLeft: number;
  neckRight: number;
  bodyLeft: number;
  bodyRight: number;
}

interface JarFloorProfile {
  centerX: number;
  centerY: number;
  radiusLeft: number;
  radiusRight: number;
  radiusY: number;
}

export interface JarProfile {
  id: string;
  aliases: readonly string[];
  assets: JarLayerAssets;
  wall: JarWallProfile;
  floor: JarFloorProfile;
}

const STANDARD_WALL: JarWallProfile = {
  neckY: 78,
  transitionEndY: 112,
  neckLeft: 48,
  neckRight: 272,
  bodyLeft: 42,
  bodyRight: 278,
};

const STANDARD_FLOOR: JarFloorProfile = {
  centerX: 161,
  centerY: 306,
  radiusLeft: 118,
  radiusRight: 118,
  radiusY: 42,
};

/**
 * Coordinate contract for every jar:
 * - All physics values use the fixed 320 x 380 overlay canvas.
 * - `back` renders below gifts and `front` renders above gifts.
 * - Both PNG layers must share the exact same transparent canvas, dimensions,
 *   artwork position and scale. A jar with no split artwork may leave `front` empty.
 * - Add a new jar by adding one profile here; overlay code must not branch by jar id.
 */
export const JAR_PROFILES: readonly JarProfile[] = [
  {
    id: 'standard',
    aliases: ['standard'],
    assets: {
      back: '/jar/jar_back.png',
      front: '/jar/jar_front.png',
      colorized: true,
      scale: 1,
    },
    wall: STANDARD_WALL,
    floor: STANDARD_FLOOR,
  },
  {
    id: 'custom_1',
    aliases: ['custom_1', 'jar_ct1'],
    assets: {
      back: '/jar/jar_custom/jar_ct1/jar_back.png',
      front: '/jar/jar_custom/jar_ct1/jar_front.png',
      middleMask: '/jar/jar_custom/jar_ct1/jar_middle_mask.png',
      colorized: false,
      scale: 1,
    },
    wall: {
      neckY: 70,
      transitionEndY: 112,
      neckLeft: 54,
      neckRight: 266,
      bodyLeft: 30,
      bodyRight: 290,
    },
    floor: {
      centerX: 160,
      centerY: 310,
      radiusLeft: 126,
      radiusRight: 126,
      radiusY: 28,
    },
  },
];

const JAR_DECORATIONS = {
  pro_1: { src: '/jar/decoration/jar_pro_1_decoration.png', scaleX: 1, scaleY: 1, x: -8, y: 0 },
  pro_2: { src: '/jar/decoration/jar_pro_2_decoration.png', scaleX: 1, scaleY: 1, x: 0, y: 0 },
  pro_3: { src: '/jar/decoration/jar_pro_3_decoration.png', scaleX: 1, scaleY: 1, x: 0, y: 0 },
  pro_4: { src: '/jar/decoration/jar_pro_4_decoration.png', scaleX: 1, scaleY: 1, x: 0, y: 0 },
  custom_1: { src: '/jar/jar_custom/jar_ct1/jar_decoration.png', scaleX: 1, scaleY: 1, x: 0, y: 0 },
} as const;

export function getJarDecoration(id?: string) {
  return JAR_DECORATIONS[(id || 'pro_1') as keyof typeof JAR_DECORATIONS] || JAR_DECORATIONS.pro_1;
}

const DEFAULT_PROFILE = JAR_PROFILES[0];

export function getJarProfile(jarType?: string): JarProfile {
  return JAR_PROFILES.find((profile) => profile.aliases.includes(jarType || 'standard')) || DEFAULT_PROFILE;
}

export function getJarBottomY(x: number, jarType?: string): number {
  const { floor } = getJarProfile(jarType);
  const radiusX = x < floor.centerX ? floor.radiusLeft : floor.radiusRight;
  const dx = Math.min(1, Math.max(-1, (x - floor.centerX) / radiusX));
  return floor.centerY + floor.radiusY * Math.sqrt(1 - dx * dx);
}

export function getJarWallBounds(y: number, jarType?: string): { left: number; right: number } {
  const profile = getJarProfile(jarType);
  const { wall, floor } = profile;
  const transitionLength = Math.max(1, wall.transitionEndY - wall.neckY);
  const transition = Math.min(1, Math.max(0, (y - wall.neckY) / transitionLength));

  let left = wall.neckLeft + (wall.bodyLeft - wall.neckLeft) * transition;
  let right = wall.neckRight + (wall.bodyRight - wall.neckRight) * transition;

  if (y >= floor.centerY) {
    const dy = (y - floor.centerY) / floor.radiusY;
    if (dy < 1) {
      const curve = Math.sqrt(1 - dy * dy);
      left = Math.max(left, floor.centerX - floor.radiusLeft * curve);
      right = Math.min(right, floor.centerX + floor.radiusRight * curve);
    }
  }

  return { left, right };
}
