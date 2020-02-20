module.exports = {
    target: "electron-renderer",
    externals: {
        sequelize: "require('sequelize')"
    }
};