function transferArrayToObj(key, arr) {
    let map = {}
    arr.forEach(obj => map[obj[key]] = obj);
    return map;
}

function transferObjToArray(obj) {
    let array = []
    Object.keys(obj).forEach(o => array.push(obj[o]));
    return array;
}

module.exports = {
    transferArrayToObj,
    transferObjToArray
}