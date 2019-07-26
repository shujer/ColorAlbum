const colors = ['#FBE864', '#6441a5', '#5e5e5f', '#FFFFF3'];

module.exports = function genColor(index) {
    return colors[index % 4];
}
