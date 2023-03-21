const introduce_audio = {
    a: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'],
    b: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10'],
    c: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'],
    d: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10'],
    e: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10'],
    f: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10'],
    g: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10'],
}
/**
 * 1 生成7个数组，每个数组有10个不同的字符串。
 * 2 生成一个新的数组，从这7个数组中各取一项
 * 3 生成10个新数组，每个数组都是从这7个数组中各取一项,且这10个数组中两两相邻元素同其它数组相同索引的不同
 * @type {string[]}
 */
const order_list = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
const quantity = 45
const getList = (order_list, introduce_audio, quantity) => {
    let all_lists = order_list.map(item => introduce_audio[item]);
    let result = [];
    let a = 0;
    for (let i = 0; i < quantity; i++) {
        let current_list = [];
        for (let j = 0; j < all_lists.length; j++) {
            let lst = all_lists[j].slice();
            let selected_value;
            if (j == 0) {
                if (a < lst.length) {
                    selected_value = lst[a];
                } else {
                    return result;
                }
            } else {
                let valid = true;
                while (valid) {
                    selected_value = lst[Math.floor(Math.random() * lst.length)];
                    lst.splice(lst.indexOf(selected_value), 1);
                    if (lst.length == 0) {
                        a += 1;
                        break;
                    }
                    for (let c = 0; c < result.length; c++) {
                        if (result[c][j] == selected_value && result[c][j - 1] == current_list[current_list.length - 1]) {
                            break;
                        }
                        if (c == result.length - 1) {
                            valid = false;
                        }
                    }
                }
            }
            current_list.push(selected_value);
        }
        result.push(current_list);
    }

    console.log(result)
    return result;
}

getList(order_list, introduce_audio, quantity)