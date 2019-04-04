const ROWS = 4; //行数 列数
const NUMBERS = [2, 4]; //新生成的数值
const MIN_LENGTH = 50;
const MOVE_TIME = 0.05;


cc.Class({
    extends: cc.Component,

    properties: {
        gap: 20,
        scoreLabel: cc.Label,
        score: 0,
        blackPrefab: cc.Prefab,
        bg: cc.Node
    },


    onDestroy() {
        cc.log("====onDestory===");
    },

    onLoad() {
        cc.log("==onLoad=");
    },

    start() {
        cc.log("=====start==1=");
        this.drawBgBlocks();
        this.init();
        this.addEventHandler();
    },
    drawBgBlocks() {
        this.blackSize = (cc.winSize.width - this.gap * (ROWS + 1)) / ROWS;// 一个格子的大小
        //第一个格子的的位置
        let x = this.gap + this.blackSize / 2;
        let y = this.blackSize;
        this.positions = [];


        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; j++) {
                let data = [];
                for (let k = 0; k < ROWS; ++k) {
                    data.push(0);
                }
                this.positions.push(data);
                let block = cc.instantiate(this.blackPrefab);
                block.width = this.blackSize;
                block.height = this.blackSize;
                this.bg.addChild(block);
                block.setPosition(x, y);
                this.positions[i][j] = cc.v2(x, y);
                x += this.gap + this.blackSize;//下一个格子的x坐标

                block.getComponent("block").setNumber(0);
            }
            y += this.gap + this.blackSize;
            x = this.gap + this.blackSize / 2;
        }


    },
    init() {
        //销毁已经存在的block
        if (this.blocks) {
            for (let i = 0; i < ROWS; ++i) {
                for (let j = 0; j < ROWS; ++j) {
                    if (this.blocks[i][j] != null) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }

        this.data = [];
        this.blocks = [];
        //初始化
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {
                let data = [];
                let data2 = [];
                for (let k = 0; k < ROWS; ++k) {
                    data.push(null);
                    data2.push(0);
                }
                this.blocks.push(data);//存储 block对象
                this.data.push(data2); //存储数值
            }
        }


        this.addBlock();
        this.addBlock();
        this.addBlock();

        this.updateScore(0);

    },
    //找出空闲的块
    // @return 空闲块的map位置
    getEmptyLocation() {
        let location = [];
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {
                if (this.blocks[i][j] == null) {
                    location.push({x: i, y: j})
                }
            }
        }
        return location;
    },

    addBlock() {
        let location = this.getEmptyLocation();
        if (location.length == 0) return false; //游戏结束

        let index = Math.floor(Math.random() * location.length);
        cc.log(index);
        let x = location[index].x; //第几行
        let y = location[index].y;  //第几列
        cc.log(index, x, y);

        let postion = this.positions[x][y]; //得到位置

        let block = cc.instantiate(this.blackPrefab);
        block.width = this.blackSize;
        block.height = this.blackSize;
        this.bg.addChild(block);
        block.setPosition(postion);
        let number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        block.getComponent("block").setNumber(number);

        this.blocks[x][y] = block;
        this.data[x][y] = number;
        return true; //继续添加
    },


    updateScore(number) {
        this.scoreLabel.string = "分数:" + number;
        this.score = number;
    },

    addEventHandler() {

        this.bg.on(cc.Node.EventType.TOUCH_START, (event) => {
            cc.log("==touchStart===");
            this.startPoint = event.getLocation();

        });
        this.bg.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.touchEnd(event);

        });
        this.bg.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            this.touchEnd(event);
        });
    },
    touchEnd(event) {
        this.endPoint = event.getLocation();

        let vec = this.endPoint.sub(this.startPoint); //p1.sub(p2)  instead cc.pSub(p1,p2);

        if (vec.mag() > MIN_LENGTH) { //vec.mag()  instead  cc.pLength(vec) //滑动的长度
            if (Math.abs(vec.x) > Math.abs(vec.y)) {//水平方向
                if (vec.x > 0) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }

            } else { //竖直方向
                if (vec.y > 0) {
                    this.moveUp();
                } else {
                    this.moveDown();
                }
            }

        }
    },
    afterMove(hasMoved) {
        if (hasMoved) {
            this.updateScore(this.score + 1); //分数更新
            this.addBlock();
        }
        //判断是否结束
        if (this.checkFail()) {
            this.gameOver();
        }
    },
    checkFail() {
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {//从左向右遍历
                let n = this.data[i][j];
                if (n == 0) return false;
                if (j > 0 && this.data[i][j - 1] == n) return false;
                if (j < ROWS - 1 && this.data[i][j + 1] == n) return false;
                if (i > 0 && this.data[i - 1][j] == n) return false;
                if (i < ROWS - 1 && this.data[i + 1][j] == n) return false;
            }
        }
        return true;
    },
    gameOver() {
        cc.log("game over!");


    },

    /**
     * @param {cc.Node} block
     *
     *
     * */
    doMove(block, position, callback) {
        let move = cc.moveTo(MOVE_TIME, position);
        let callFunc = cc.callFunc(() => {
            callback && callback();
        });
        block.runAction(cc.sequence(move, callFunc));
    },

    moveLeft() {
        cc.log("====moveRight===");

        let hasMoved = false;
        let move = (x, y, callback) => {
            if (y == 0 || this.data[x][y] == 0) {
                cc.log("-----case 1---");
                callback && callback();
                return;
            } else if (this.data[x][y - 1] == 0) {//前面是空的
                cc.log("-----case 移动---");
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x][y - 1];//前面block的位置
                this.blocks[x][y - 1] = block;
                this.data[x][y - 1] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    move(x, y - 1, callback);
                });
                hasMoved = true;
            } else if (this.data[x][y - 1] == this.data[x][y]) {
                cc.log("-----case 合并--");
                //合并
                let block = this.blocks[x][y];
                let position = this.positions[x][y - 1];//前面block的位置
                this.data[x][y - 1] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                cc.log("====number===" + this.data[x][y - 1]);
                this.blocks[x][y - 1].getComponent('block').setNumber(this.data[x][y - 1]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true
            } else { //前面的值不同
                cc.log("-----case 前面的值不同 结束--");
                callback && callback();
                return;
            }
        };
        let toMove = []; //存储要移动的block
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < ROWS; ++j) {//从左向右遍历
                if (this.data[i][j] !== 0) {
                    toMove.push({x: i, y: j});
                }
            }
        }

        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                if (counter === toMove.length) {
                    this.afterMove(hasMoved);
                }
            });
        }


    },
    moveRight() {
        cc.log("====moveLeft===");
        let hasMoved = false;
        let move = (x, y, callback) => {
            if (y == ROWS - 1 || this.data[x][y] == 0) {
                cc.log("-----case 1---");
                callback && callback();
                return;
            } else if (this.data[x][y + 1] == 0) {//前面是空的
                cc.log("-----case 移动---");
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x][y + 1];//前面block的位置
                this.blocks[x][y + 1] = block;
                this.data[x][y + 1] = this.data[x][y];
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.doMove(block, position, () => {
                    move(x, y + 1, callback);
                });
                hasMoved = true;
            } else if (this.data[x][y + 1] == this.data[x][y]) {
                cc.log("-----case 合并--");
                //合并
                let block = this.blocks[x][y];
                let position = this.positions[x][y + 1];//前面block的位置
                this.data[x][y + 1] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x][y + 1].getComponent('block').setNumber(this.data[x][y + 1]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true
            } else { //前面的值不同
                cc.log("-----case 前面的值不同 结束--");
                callback && callback();
                return;
            }
        };
        let toMove = []; //存储要移动的block
        for (let i = 0; i < ROWS; ++i) {
            for (let j = ROWS - 1; j >= 0; --j) { //从右向左遍历
                if (this.data[i][j] !== 0) {
                    toMove.push({x: i, y: j});
                }
            }
        }

        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                if (counter === toMove.length) {
                    this.afterMove(hasMoved);
                }
            });
        }
    },
    moveUp() {
        cc.log("====moveUp===");
        let hasMoved = false;
        let move = (x, y, callback) => {
            if (x == ROWS - 1 || this.data[x][y] == 0) {
                cc.log("-----case 1---");
                callback && callback();
                return;
            } else if (this.data[x + 1][y] == 0) {//前面是空的
                cc.log("-----case 移动---");
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x + 1][y];//前面block的位置
                this.blocks[x + 1][y] = block;
                this.data[x + 1][y] = this.data[x][y];
                this.blocks[x][y] = null;
                this.data[x][y] = 0;
                this.doMove(block, position, () => {
                    move(x + 1, y, callback);
                });
                hasMoved = true;
            } else if (this.data[x + 1][y] == this.data[x][y]) {
                cc.log("-----case 合并--");
                //合并
                let block = this.blocks[x][y];
                let position = this.positions[x + 1][y];//前面block的位置
                this.data[x + 1][y] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x + 1][y].getComponent('block').setNumber(this.data[x + 1][y]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true
            } else { //前面的值不同
                cc.log("-----case 前面的值不同 结束--");
                callback && callback();
                return;
            }
        };
        let toMove = []; //存储要移动的block
        for (let i = ROWS - 1; i >= 0; --i) {//从上到下遍历
            for (let j = 0; j < ROWS; ++j) {
                if (this.data[i][j] !== 0) {
                    toMove.push({x: i, y: j});
                }
            }
        }

        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                if (counter === toMove.length) {
                    this.afterMove(hasMoved);
                }
            });
        }
    },
    moveDown() {
        cc.log("====moveDown===");
        let hasMoved = false;
        let move = (x, y, callback) => {
            if (x == 0 || this.data[x][y] == 0) {
                cc.log("-----case 1---");
                callback && callback();
                return;
            } else if (this.data[x - 1][y] == 0) {//前面是空的
                cc.log("-----case 移动---");
                //移动
                let block = this.blocks[x][y];
                let position = this.positions[x - 1][y];//前面block的位置
                this.blocks[x - 1][y] = block;
                this.data[x - 1][y] = this.data[x][y];
                this.blocks[x][y] = null;
                this.data[x][y] = 0;
                this.doMove(block, position, () => {
                    move(x - 1, y, callback);
                });
                hasMoved = true;
            } else if (this.data[x - 1][y] == this.data[x][y]) {
                cc.log("-----case 合并--");
                //合并
                let block = this.blocks[x][y];
                let position = this.positions[x - 1][y];//前面block的位置
                this.data[x - 1][y] *= 2;
                this.data[x][y] = 0;
                this.blocks[x][y] = null;
                this.blocks[x - 1][y].getComponent('block').setNumber(this.data[x - 1][y]);
                this.doMove(block, position, () => {
                    block.destroy();
                    callback && callback();
                });
                hasMoved = true
            } else { //前面的值不同
                cc.log("-----case 前面的值不同 结束--");
                callback && callback();
                return;
            }
        };
        let toMove = []; //存储要移动的block
        for (let i = 0; i < ROWS; ++i) {//从上到下遍历
            for (let j = 0; j < ROWS; ++j) {
                if (this.data[i][j] !== 0) {
                    toMove.push({x: i, y: j});
                }
            }
        }

        let counter = 0;
        for (let i = 0; i < toMove.length; ++i) {
            move(toMove[i].x, toMove[i].y, () => {
                counter++;
                if (counter === toMove.length) {
                    this.afterMove(hasMoved);
                }
            });
        }
    }

});
