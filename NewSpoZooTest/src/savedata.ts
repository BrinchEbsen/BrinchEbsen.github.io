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
        sceneTileWidth: 15,
        sceneTileHeight: 10,
        spos: [],
        fencePositions: [],
        grassPositions: []
    };
}