type SpoSaveData = {
    pos: Vec,
    type: SpoType
};

type SaveData = {
    sceneTileWidth: number,
    sceneTileHeight: number,
    spos: SpoSaveData[],
    fencePositions: Vec[],
    grassPositions: Vec[]
};

function createEmptySave(): SaveData {
    return {
        sceneTileWidth: 0,
        sceneTileHeight: 0,
        spos: [],
        fencePositions: [],
        grassPositions: []
    };
}