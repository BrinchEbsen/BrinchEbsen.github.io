"use strict";
const AssetsFolder = "assets";
const SpoTypes = [
    "regular",
    "gold",
    "void",
    "ember"
];
const SpoAnimInfoList = [
    { name: "stand_up", rate: 0.25, numFrames: 12 },
    { name: "stand_upright", rate: 0.25, numFrames: 12 },
    { name: "stand_right", rate: 0.25, numFrames: 12 },
    { name: "stand_downright", rate: 0.25, numFrames: 12 },
    { name: "stand_down", rate: 0.25, numFrames: 12 },
    { name: "stand_downleft", rate: 0.25, numFrames: 12 },
    { name: "stand_left", rate: 0.25, numFrames: 12 },
    { name: "stand_upleft", rate: 0.25, numFrames: 12 },
    { name: "walk_up", rate: 0.5, numFrames: 12 },
    { name: "walk_upright", rate: 0.5, numFrames: 12 },
    { name: "walk_right", rate: 0.5, numFrames: 12 },
    { name: "walk_downright", rate: 0.5, numFrames: 12 },
    { name: "walk_down", rate: 0.5, numFrames: 12 },
    { name: "walk_downleft", rate: 0.5, numFrames: 12 },
    { name: "walk_left", rate: 0.5, numFrames: 12 },
    { name: "walk_upleft", rate: 0.5, numFrames: 12 }
];
const SpoAnimFrames = new Map;
function preloadSpoAnimFrames() {
    const promises = [];
    SpoTypes.forEach(t => {
        SpoAnimInfoList.forEach(info => {
            const frames = [];
            for (let i = 0; i < info.numFrames; i++) {
                const img = new Image();
                const imgPath = `${AssetsFolder}/spo/${t}/${info.name}/${i}.png`;
                img.src = imgPath;
                frames.push(img);
                promises.push(new Promise(resolve => {
                    img.onload = resolve;
                }));
            }
            SpoAnimFrames.set(t + "_" + info.name, frames);
        });
    });
    return Promise.all(promises);
}
const FenceFrameNames = [
    "fence_",
    "fence_U",
    "fence_UR",
    "fence_URD",
    "fence_URDL",
    "fence_URL",
    "fence_UD",
    "fence_UDL",
    "fence_UL",
    "fence_R",
    "fence_RD",
    "fence_RDL",
    "fence_RL",
    "fence_D",
    "fence_DL",
    "fence_L"
];
const FenceFrames = new Map;
function preloadFenceFrames() {
    const promises = [];
    FenceFrameNames.forEach(name => {
        const img = new Image();
        const imgPath = `${AssetsFolder}/fence/${name}.png`;
        img.src = imgPath;
        FenceFrames.set(name, img);
        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    });
    return Promise.all(promises);
}
const NumSparkleFrames = 7;
const SparkleFrames = [];
function preloadSparkleFrames() {
    const promises = [];
    for (let i = 0; i < NumSparkleFrames; i++) {
        const img = new Image();
        const imgPath = `${AssetsFolder}/sparkle/${i}.png`;
        img.src = imgPath;
        SparkleFrames.push(img);
        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    }
    return Promise.all(promises);
}
let SweatDropFrame;
function preloadSweatDropFrame() {
    const img = new Image();
    img.src = `${AssetsFolder}/misc/sweat.png`;
    SweatDropFrame = img;
    return new Promise(resolve => {
        img.onload = resolve;
    });
}
function preloadAllFrames() {
    return Promise.all([
        preloadSpoAnimFrames(),
        preloadFenceFrames(),
        preloadSparkleFrames(),
        preloadSweatDropFrame()
    ]);
}
