import { Player, system, world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// GPT生成
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateShuffledMatrix(size) {
    const matrix = [];
    const baseArray = Array.from({ length: size }, (_, i) => i);

    for (let i = 0; i < size; i++) {
        let row;
        do {
            row = shuffleArray([...baseArray]);
        } while (matrix.some(existingRow => existingRow.some((num, idx) => num === row[idx])));
        matrix.push(row);
    }

    return matrix;
}

let agree = 0;
let agreepoint = 0;

let gamestart = false;

async function games(sender) {
    const allplayer = world.getPlayers();
    agree = 0;
    agreepoint = 0;
    await system.runTimeout(() => {
        const startok = new ActionFormData();
        allplayer.forEach((v, i, a) => {
            startok.title("スタートしていい？").button("Yes").button("No").show(v).then((re2) => {
                switch (re2.selection) {
                    case 0:
                        agreepoint++;
                        agree++;
                        game3(sender, v);
                        break;
                    case 1:
                        agreepoint++;
                        break;
                }
            });
        });
    }, 5);
}

async function game3(sender, v, a) {
    const allplayer = world.getPlayers();
    let playernum = allplayer.length;
    if (agreepoint >= playernum) {
        if (agree >= agreepoint) {
            agree = 0;
            agreepoint = 0;
            world.getPlayers().forEach((v, i, a) => {
                v.playSound("random.levelup", { pitch: 2 });
            });
            world.sendMessage("全員の同意が得られたので開始します");
            await system.waitTicks(20 * 5);
            games2(allplayer, playernum, sender);
        }
        else if (agree < agreepoint) {
            world.getPlayers().forEach((v, i, a) => {
                v.playSound("random.pop", { pitch: 0.5 });
            });
            world.sendMessage("全員の同意が得られませんでした。(´;ω;｀)");
            agree = 0;
            agreepoint = 0;
        }
    }
    else {
        v.sendMessage("同意しました。全員が同意するまでしばらくお待ちください。")
    }
}

/**
 * @param {Player} sender
 * @param {number} playernum
 */
async function game4(playernum, playermatrix, one, sender) {
    world.getPlayers().forEach((v, i, a) => {
        v.playSound("random.levelup", { pitch: 2 });
    });
    world.sendMessage("全員終わりました！(多分)");
    await system.waitTicks(20 * 5);
    world.getPlayers().forEach((v, i, a) => {
        v.playSound("random.levelup", { pitch: 2 });
    });
    world.sendMessage("結果発表");
    await system.waitTicks(20 * 5);
    if (one = true) {
        world.sendMessage(playermatrix[0] + ": " + playermatrix[1]);
        world.getPlayers().forEach((v, i, a) => {
            v.playSound("random.orb", { pitch: 0.5 });
        });
        await system.waitTicks(20 * 5);
    }
    else {
        for (let publici = 0; publici < playernum; publici++) {
            let wordall = "";
            for (let publicj = 0; publicj < playernum; publicj++) {
                world.sendMessage(playermatrix[publici][publicj][0] + ": " + playermatrix[publici][publicj][1]);
                wordall += playermatrix[publici][publicj][1] + " ";
                world.getPlayers().forEach((v, i, a) => {
                    v.playSound("random.orb", { pitch: 0.5 });
                });
                await system.waitTicks(20 * 5);
            }
            world.sendMessage(publici + ": " + wordall);
            world.getPlayers().forEach((v, i, a) => {
                v.playSound("random.pop", { pitch: 0.5 });
            });
            await system.waitTicks(20 * 10);
            world.sendMessage("次に行きます");
            await system.waitTicks(20 * 10);
        }
    }
    world.sendMessage("すべて終了しました");
    world.getPlayers().forEach((v, i, a) => {
        v.playSound("random.pop", { pitch: 0.5 });
    });
    gamestart = false;
    await system.waitTicks(20 * 5);
}

/**
 * @param {Player[]} allplayer
 * @param {number} playernum
 */
async function game5(allplayer, playernum, playermatrix, doneS, one, gamecount, sender) {
    await system.waitTicks(20 * 5);
    await system.run(() => {
        if (gamecount <= 0) {
            allplayer.forEach((v, j, a) => {
                doneS[gamecount] = 0;
                game6(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender);
            });
        }
        else if (gamecount >= playernum) {
            game4(playernum, playermatrix, one, sender);
        }
        else if (gamecount >= 1 && playernum <= 1) {
            game4(playernum, playermatrix, one, sender);
        }
        else {
            allplayer.forEach((v, j, a) => {
                doneS[gamecount] = 0;
                game7(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender);
            });
        }
    });
}

/**
 * @param {Player[]} allplayer
 * @param {number} playernum
 */
async function game6(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender) {
    await system.waitTicks(20 * 5);
    const gameformsf = new ModalFormData();
    gameformsf.title((gamecount + 1) + "回目 ※変更はできません 20文字までです").textField("story", "ここにストーリを入力").show(v).then((re3) => {
        let spc = String(re3.formValues);
        if (spc.length > 20) {
            v.sendMessage("20文字を超えています。もう一度お試しください。");
            v.playSound("random.pop", { pitch: 0.5 });
            game6(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender);
        }
        else if (spc === "" || spc === undefined || spc === null || spc === "undefined" || spc === "null") {
            v.sendMessage("空欄です。もう一度お試しください。");
            v.playSound("random.pop", { pitch: 0.5 });
            game6(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender);
        }
        else {
            for (let k = 0; k < playernum; k++) {
                if (one = true) {
                    playermatrix = [v.name, spc];
                }
                else {
                    if (playermatrix[k][0] === j) {
                        playermatrix[k][0] = [v.name, spc];
                    }
                }
            }
            if (playernum <= 1) {
                v.sendMessage((gamecount + 1) + "回目にあなたが入力したもの: " + spc + " ※全員が終わるまでしばらくお待ちください...");
                v.playSound("random.levelup", { pitch: 2 });
                doneS[gamecount]++;
                world.sendMessage("現在" + doneS[gamecount] + "人が終わっています。");
                gamecount++;
                game5(allplayer, playernum, playermatrix, doneS, one, gamecount, sender);
            }
            else {
                doneS[gamecount]++;
                v.sendMessage((gamecount + 1) + "回目にあなたが入力したもの: " + spc + " ※全員が終わるまでしばらくお待ちください...");
                v.playSound("random.levelup", { pitch: 2 });
                if (doneS[gamecount] >= playernum) {
                    world.sendMessage("全員終わりました。");
                    gamecount++;
                    game5(allplayer, playernum, playermatrix, doneS, one, gamecount, sender);
                }
            }
        }
    });
}

/**
 * @param {Player[]} allplayer
 * @param {number} playernum
 */
async function game7(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender) {
    await system.waitTicks(20 * 5);
    for (let k = 0; k < playernum; k++) {
        if (playermatrix[k][gamecount] === j) {
            const gameforms = new ModalFormData();
            gameforms.title((gamecount + 1) + "回目 \n20文字までです").textField(playermatrix[k][gamecount][1], "ここにストーリの続きを入力").show(v).then((re3) => {
                let spc = String(re3.formValues);
                if (spc.length > 20) {
                    v.sendMessage("20文字を超えています。もう一度お試しください");
                    v.playSound("random.pop", { pitch: 0.5 });
                    game7(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender);
                }
                else if (spc === "" || spc === undefined || spc === null || spc === "undefined" || spc === "null") {
                    v.sendMessage("空欄です。もう一度お試しください。");
                    v.playSound("random.pop", { pitch: 0.5 });
                    game7(allplayer, playernum, playermatrix, doneS, one, gamecount, v, j, a, sender);
                }
                else {
                    for (let l = 0; l < playernum; l++) {
                        if (playermatrix[l][gamecount] === j) {
                            playermatrix[l][gamecount] = [v.name, spc];
                        }
                    }
                    v.sendMessage((gamecount + 1) + "回目にあなたが入力したもの: " + spc + " ※全員が終わるまでしばらくお待ちください...");
                    v.playSound("random.levelup", { pitch: 2 });
                    doneS[gamecount]++;
                    if (doneS[gamecount] >= playernum) {
                        world.sendMessage("全員終わりました。");
                        gamecount++;
                        game5(allplayer, playernum, playermatrix, doneS, one, gamecount, sender);
                    }
                }
            });
        }
    }
}

/**
 * @param {Player[]} allplayer
 * @param {number} playernum
 */
function games2(allplayer, playernum) {
    world.sendMessage("開始します");
    let playermatrix = 0;
    let doneS = [];
    let one = false;
    if (playernum <= 1) {
        playermatrix = null;
        one = true;
    }
    else {
        playermatrix = generateShuffledMatrix(playernum);
    }
    let gamecount = 0;
    gamestart = true;
    game5(allplayer, playernum, playermatrix, doneS, one, gamecount);
}

world.beforeEvents.chatSend.subscribe(async (e) => {
    await system.runTimeout(() => {
        if (e.message === "ゲームを開始する" && gamestart === false) {
            world.sendMessage("ゲームが間もなく開始される可能性があります");
            const formstart = new ActionFormData();
            formstart.title("ゲームを開始する？").body("ゲームを開始しますか？(ほぼマイクラは操作しません)").button("はい").button("いいえ").show(e.sender).then((re) => {
                switch (re.selection) {
                    case 0:
                        games(e.sender);
                        break;
                    case 1:
                        world.sendMessage("キャンセルされました。");
                        break;
                }
            });
        }
    }, 100);
});