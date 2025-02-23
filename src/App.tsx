import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import { Game } from './game/scenes/Game';
import { GameConfig } from './game/config/GameConfig';

function App()
{
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const [debugInfo, setDebugInfo] = useState({
        coords: { x: 0, y: 0 },
        chunkCoords: { x: 0, y: 0 }
    });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if(phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star');
    
                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        if (scene.scene.key === 'Game') {
            const updateInterval = setInterval(() => {
                if (phaserRef.current?.scene) {
                    const gameScene = phaserRef.current.scene as Game;
                    const playerPos = gameScene.getPlayerPosition();
                    if (playerPos) {
                        const worldX = Math.floor(playerPos.x / GameConfig.GRID.TILE_SIZE);
                        const worldY = Math.floor(playerPos.y / GameConfig.GRID.TILE_SIZE);
                        const chunkX = Math.floor(worldX / GameConfig.GRID.CHUNK_SIZE);
                        const chunkY = Math.floor(worldY / GameConfig.GRID.CHUNK_SIZE);
                        
                        setDebugInfo({
                            coords: { x: worldX, y: worldY },
                            chunkCoords: { x: chunkX, y: chunkY }
                        });
                    }
                }
            }, 100);

            return () => clearInterval(updateInterval);
        }
        setCanMoveSprite(scene.scene.key === 'MainMenu');
    }

    const loadScene = (sceneName: string) => {
        if (phaserRef.current?.scene) {
            const currentScene = phaserRef.current.scene.scene.key;
            if (currentScene !== sceneName) {
                phaserRef.current.scene.scene.start(sceneName);
            }
        }
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div className="debug-panel">
                <h3>Debug Information</h3>
                <div className="debug-info">
                    <pre>
{`World Position:
  X: ${debugInfo.coords.x}
  Y: ${debugInfo.coords.y}

Current Chunk: (${debugInfo.chunkCoords.x}, ${debugInfo.chunkCoords.y})
`}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default App
