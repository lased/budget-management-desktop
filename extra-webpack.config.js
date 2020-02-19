module.exports = {
    target: "electron-renderer",
    externals: {
        sequelize: "require('sequelize')",
        "brain.js": "require('brain.js')"
    }
};