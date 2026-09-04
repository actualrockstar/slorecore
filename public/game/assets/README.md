# Get To The Show — Game Assets

This directory is reserved for custom game artwork to replace the programmatic placeholders.

## Current State

The game currently generates all graphics programmatically using Phaser's Graphics API.
No image files are required for the game to run.

## Replacing Placeholders

When you're ready to add custom artwork, place files here and update `src/game/config/assetManifest.ts`.

### Expected Asset Specifications

#### Player
- **File:** `player.png`
- **Size:** 36×50px (or spritesheet with frames)
- **Format:** PNG with transparency
- **Notes:** Character facing the viewer (running toward camera). For animation, use a horizontal spritesheet with consistent frame size.

#### Collectibles (each ~28×28px unless noted)
| Item | File | Size | Notes |
|------|------|------|-------|
| Guitar | `guitar.png` | 28×28 | Red electric guitar icon |
| Microphone | `microphone.png` | 28×28 | Stage mic icon |
| Drum/Cymbal | `drum.png` | 28×28 | Snare or cymbal icon |
| Band Merch | `merch.png` | 28×28 | T-shirt icon |
| Concert Ticket | `ticket.png` | 28×28 | Ticket stub icon |
| Golden Record | `rare.png` | 32×32 | Gold vinyl record (rare item) |

#### Obstacles (varied sizes)
| Item | File | Size | Notes |
|------|------|------|-------|
| Taxi | `taxi.png` | 48×36 | Yellow NYC taxi, top-down view |
| Car | `car.png` | 44×32 | Generic car, top-down view |
| Trash Can | `trash.png` | 28×32 | NYC trash can |
| Construction Barrier | `barrier.png` | 48×20 | Orange/white striped barrier |
| Citi Bike | `bike.png` | 24×40 | Blue Citi Bike |
| Rat | `rat.png` | 20×16 | NYC rat |
| Pothole/Manhole | `pothole.png` | 36×12 | Dark circle, flat on road |

#### Scenery
| Item | File | Size | Notes |
|------|------|------|-------|
| Road | `road.png` | 390×200 | Tiling road texture |
| Building Left | `building_left.png` | 60×150 | NYC building silhouette |
| Building Right | `building_right.png` | 60×150 | NYC building silhouette |

### Art Direction

The eventual visual style should be:
- **Rough, punk, DIY aesthetic**
- **Slightly trashy NYC arcade-game energy**
- NOT polished corporate mobile-game art
- Think hand-drawn, photocopied zine, spray paint, sticker art
- Pixel art or lo-fi illustration are both good directions

### Format Requirements
- All images: **PNG with transparency**
- Keep file sizes reasonable (under 100KB per asset)
- Use consistent pixel density
- Test on both phone and desktop screens
