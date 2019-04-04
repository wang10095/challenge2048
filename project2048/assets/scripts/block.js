import colors from 'colors';

cc.Class({
    extends: cc.Component,

    properties: {
        numberLable: cc.Label,
        number: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    setNumber(number) {

        if (number === 0) {
            this.numberLable.node.active = false;
        }
        this.numberLable.string = number;
        if (number in colors) {
            this.node.color = colors[number];
        }
        this.number = number;

    }

    // update (dt) {},
});
