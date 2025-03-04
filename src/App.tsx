import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { Game } from './game/scenes/Game';
import { GameConfig } from './game/config/GameConfig';
import { CoordinateUtils } from './game/utils/CoordinateUtils';

function App()
{
    // State to track if debug panel is collapsed
    const [isDebugCollapsed, setIsDebugCollapsed] = useState(false);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const [debugInfo, setDebugInfo] = useState({
        coords: { x: 0, y: 0 },
        chunkCoords: { x: 0, y: 0 },
        tileType: { name: '', color: 0, isWall: false }
    });

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        if (scene.scene.key === 'Game') {
            const updateInterval = setInterval(() => {
                if (phaserRef.current?.scene) {
                    const gameScene = phaserRef.current.scene as Game;
                    const playerPos = gameScene.getPlayerPosition();
                    const currentTileType = gameScene.getCurrentTileType();
                    if (playerPos) {
                        const { tileX: worldX, tileY: worldY } = CoordinateUtils.pixelToTile(playerPos.x, playerPos.y);
                        const { chunkX, chunkY } = CoordinateUtils.tileToChunk(worldX, worldY);
                        
                        setDebugInfo({
                            coords: { x: worldX, y: worldY },
                            chunkCoords: { x: chunkX, y: chunkY },
                            tileType: currentTileType || { name: 'Unknown', color: 0, isWall: false }
                        });
                    }
                }
            }, 100);

            return () => clearInterval(updateInterval);
        }
    }

    // Toggle debug panel collapse state
    const toggleDebugPanel = () => {
        setIsDebugCollapsed(!isDebugCollapsed);
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div className={`debug-panel ${isDebugCollapsed ? 'collapsed' : ''}`}>
                <div className="debug-header" onClick={toggleDebugPanel}>
                    <h3 className="debug-title">Debug Information</h3>
                    <button className="debug-toggle">
                        {isDebugCollapsed ? '▲' : '▼'}
                    </button>
                </div>
                <div className="debug-info">
                    <pre>
{`World Position:
  X: ${debugInfo.coords.x}
  Y: ${debugInfo.coords.y}

Current Chunk: (${debugInfo.chunkCoords.x}, ${debugInfo.chunkCoords.y})

Tile Type: ${debugInfo.tileType.name}
  Wall: ${debugInfo.tileType.isWall ? 'Yes' : 'No'}
  Color: #${debugInfo.tileType.color.toString(16).padStart(6, '0')}
`}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default App
