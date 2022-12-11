# string-sdk

#Steps to run

Install dependencies
`yarn`

Create stringpay-v0.0.1.min,js and index.d.ts in /dist
`yarn bundle`

Login with your npm credentials and test publishing to npm
`npm login`
`npm publish --access public --dry-run`

Bundle and copy over files to `web-app`
`yarn release:demo`

Run iframe-app on develop
`yarn && yarn dev`

Run string-api on develop
`docker-compose up --build`

Run with bundled file and load iframe in manual integration test
`yarn dev`