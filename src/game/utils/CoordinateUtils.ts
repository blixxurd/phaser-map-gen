import { GameConfig } from '../config/GameConfig';

/**
 * Utility class for handling coordinate conversions between different coordinate systems:
 * - Pixel coordinates: Actual screen/world position in pixels
 * - Tile coordinates: Grid-based position where each tile is a discrete unit
 * - Chunk coordinates: Groups of tiles organized into chunks
 */
export class CoordinateUtils {
  private static readonly TILE_SIZE = GameConfig.GRID.TILE_SIZE;
  private static readonly CHUNK_SIZE = GameConfig.GRID.CHUNK_SIZE;

  /**
   * Convert pixel coordinates to tile coordinates
   * @param pixelX - X position in pixels
   * @param pixelY - Y position in pixels
   * @returns Tile coordinates
   */
  public static pixelToTile(pixelX: number, pixelY: number): { tileX: number, tileY: number } {
    return {
      tileX: Math.floor(pixelX / this.TILE_SIZE),
      tileY: Math.floor(pixelY / this.TILE_SIZE)
    };
  }

  /**
   * Convert tile coordinates to pixel coordinates (returns center of tile)
   * @param tileX - X position in tile coordinates
   * @param tileY - Y position in tile coordinates
   * @param centered - Whether to return the center of the tile (true) or top-left corner (false)
   * @returns Pixel coordinates
   */
  public static tileToPixel(tileX: number, tileY: number, centered: boolean = true): { pixelX: number, pixelY: number } {
    return {
      pixelX: tileX * this.TILE_SIZE + (centered ? this.TILE_SIZE / 2 : 0),
      pixelY: tileY * this.TILE_SIZE + (centered ? this.TILE_SIZE / 2 : 0)
    };
  }

  /**
   * Convert pixel coordinates to chunk coordinates
   * @param pixelX - X position in pixels
   * @param pixelY - Y position in pixels
   * @returns Chunk coordinates
   */
  public static pixelToChunk(pixelX: number, pixelY: number): { chunkX: number, chunkY: number } {
    return {
      chunkX: Math.floor(pixelX / (this.TILE_SIZE * this.CHUNK_SIZE)),
      chunkY: Math.floor(pixelY / (this.TILE_SIZE * this.CHUNK_SIZE))
    };
  }

  /**
   * Convert tile coordinates to chunk coordinates
   * @param tileX - X position in tile coordinates
   * @param tileY - Y position in tile coordinates
   * @returns Chunk coordinates
   */
  public static tileToChunk(tileX: number, tileY: number): { chunkX: number, chunkY: number } {
    return {
      chunkX: Math.floor(tileX / this.CHUNK_SIZE),
      chunkY: Math.floor(tileY / this.CHUNK_SIZE)
    };
  }

  /**
   * Convert chunk coordinates to pixel coordinates (returns top-left corner of chunk)
   * @param chunkX - X position in chunk coordinates
   * @param chunkY - Y position in chunk coordinates
   * @returns Pixel coordinates of the top-left corner of the chunk
   */
  public static chunkToPixel(chunkX: number, chunkY: number): { pixelX: number, pixelY: number } {
    return {
      pixelX: chunkX * this.CHUNK_SIZE * this.TILE_SIZE,
      pixelY: chunkY * this.CHUNK_SIZE * this.TILE_SIZE
    };
  }

  /**
   * Convert chunk coordinates to tile coordinates (returns top-left tile of chunk)
   * @param chunkX - X position in chunk coordinates
   * @param chunkY - Y position in chunk coordinates
   * @returns Tile coordinates of the top-left tile of the chunk
   */
  public static chunkToTile(chunkX: number, chunkY: number): { tileX: number, tileY: number } {
    return {
      tileX: chunkX * this.CHUNK_SIZE,
      tileY: chunkY * this.CHUNK_SIZE
    };
  }

  /**
   * Get the local tile coordinates within a chunk
   * @param tileX - Global X position in tile coordinates
   * @param tileY - Global Y position in tile coordinates
   * @returns Local tile coordinates within the chunk (0 to CHUNK_SIZE-1)
   */
  public static getLocalTileCoordinates(tileX: number, tileY: number): { localX: number, localY: number } {
    return {
      localX: ((tileX % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE,
      localY: ((tileY % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE
    };
  }
} 