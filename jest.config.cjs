module.exports = {
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    moduleFileExtensions: ["js", "ts"],
    testPathIgnorePatterns: ["node_modules"],
    bail: false,
    verbose: true,
    transformIgnorePatterns: ["node_modules"],
};
