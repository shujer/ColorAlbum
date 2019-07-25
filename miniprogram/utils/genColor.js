const colors = ['#FBE864', '#566270', '#353866', '#FFFFF3'];

module.exports = function genColor(index) {
    return colors[index % 4];
}
