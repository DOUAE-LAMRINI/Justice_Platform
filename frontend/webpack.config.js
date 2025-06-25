module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/chart\.js/,
          /node_modules\/react-chartjs-2/
        ]
      }
    ]
  }
}