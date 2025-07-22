const AssetsFolder = "assets";

type SpoAnimInfo = {
    name : string,
    rate : number,
    numFrames : number
};

const SpoTypes = [
    "regular",
    "gold",
    "void",
    "ember",
    "flame",
    "cynder"
] as const;

type SpoType = typeof SpoTypes[number];

const SpoAnimInfoList : SpoAnimInfo[] = [
    {name: "stand_up",        rate: 0.25, numFrames: 12},
    {name: "stand_upright",   rate: 0.25, numFrames: 12},
    {name: "stand_right",     rate: 0.25, numFrames: 12},
    {name: "stand_downright", rate: 0.25, numFrames: 12},
    {name: "stand_down",      rate: 0.25, numFrames: 12},
    {name: "stand_downleft",  rate: 0.25, numFrames: 12},
    {name: "stand_left",      rate: 0.25, numFrames: 12},
    {name: "stand_upleft",    rate: 0.25, numFrames: 12},
    {name: "walk_up",         rate: 0.5 , numFrames: 12},
    {name: "walk_upright",    rate: 0.5 , numFrames: 12},
    {name: "walk_right",      rate: 0.5 , numFrames: 12},
    {name: "walk_downright",  rate: 0.5 , numFrames: 12},
    {name: "walk_down",       rate: 0.5 , numFrames: 12},
    {name: "walk_downleft",   rate: 0.5 , numFrames: 12},
    {name: "walk_left",       rate: 0.5 , numFrames: 12},
    {name: "walk_upleft",     rate: 0.5 , numFrames: 12}
] as const;

const SpoAnimFrames = new Map<string, HTMLImageElement[]>();

function preloadSpoAnimFrames() : Promise<any> {
    const promises : Promise<any>[] = [];

    SpoTypes.forEach(t => {
        SpoAnimInfoList.forEach(info => {
            const frames : HTMLImageElement[] = [];

            for (let i = 0; i < info.numFrames; i++) {
                const img : HTMLImageElement = new Image();
                const imgPath = `${AssetsFolder}/spo/${t}/${info.name}/${i}.png`;
                img.src = imgPath;

                frames.push(img);
                promises.push(new Promise(resolve => {
                    img.onload = resolve;
                }));
            }

            SpoAnimFrames.set(t+"_"+info.name, frames);
        });
    });
    
    return Promise.all(promises);
}

const FenceFrameNames : string[] = [
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
] as const;

const FenceFrames = new Map<string, HTMLImageElement>();

function preloadFenceFrames() : Promise<any> {
    const promises : Promise<any>[] = [];

    FenceFrameNames.forEach(name => {
        const img : HTMLImageElement = new Image();
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

const SparkleFrames : HTMLImageElement[] = [];

function preloadSparkleFrames() : Promise<any> {
    const promises : Promise<any>[] = [];

    for (let i = 0; i < NumSparkleFrames; i++) {
        const img : HTMLImageElement = new Image();
        const imgPath = `${AssetsFolder}/sparkle/${i}.png`;
        img.src = imgPath;

        SparkleFrames.push(img);
        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    }

    return Promise.all(promises);
}

const NumWispFrames = 5;

const WispFrames: HTMLImageElement[] = [];

function preloadWispFrames() : Promise<any> {
    const promises : Promise<any>[] = [];

    for (let i = 0; i < NumWispFrames; i++) {
        const img : HTMLImageElement = new Image();
        const imgPath = `${AssetsFolder}/wisp/${i}.png`;
        img.src = imgPath;

        WispFrames.push(img);
        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    }

    return Promise.all(promises);
}

type CarrotFrameData = {
    carrot?: HTMLImageElement,
    carrotGround?: HTMLImageElement
};

const CarrotFrames: CarrotFrameData = {};

function preloadCarrotFrames(): Promise<any> {
    const imgCarrot = new Image();
    imgCarrot.src = `${AssetsFolder}/carrot/carrot.png`;
    CarrotFrames.carrot = imgCarrot;

    const imgCarrotGround = new Image();
    imgCarrotGround.src = `${AssetsFolder}/carrot/carrot_ground.png`;
    CarrotFrames.carrotGround = imgCarrotGround;

    return Promise.all([
        new Promise(resolve => {
            imgCarrot.onload = resolve;
        }),
        new Promise(resolve => {
            imgCarrotGround.onload = resolve;
        })
    ]);
}

const MiscFrameNames = [
    "sweat",
    "grass",
    "sand",
    "whitecircle"
];

const MiscFrames = new Map<string, HTMLImageElement>();

function preloadMiscFrames(): Promise<any> {
    const promises : Promise<any>[] = [];

    for (let i = 0; i < MiscFrameNames.length; i++) {
        const img : HTMLImageElement = new Image();
        const imgPath = `${AssetsFolder}/misc/${MiscFrameNames[i]}.png`;
        img.src = imgPath;

        MiscFrames.set(MiscFrameNames[i], img);
        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    }

    return Promise.all(promises);
}

function preloadAllFrames(): Promise<any> {
    return Promise.all([
        preloadSpoAnimFrames(),
        preloadFenceFrames(),
        preloadSparkleFrames(),
        preloadWispFrames(),
        preloadCarrotFrames(),
        preloadMiscFrames()
    ]);
}