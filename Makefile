export
AWS_PROFILE=${env}-string
dev_S3_BUCKET=cdn.dev.string-api.xyz
prod_S3_BUCKET=cdn.string-api.xyz
dev_DISTRIBUTION_ID=E1K365K6R2AK78
prod_DISTRIBUTION_ID=E3KWJW61GREU9J
include .${env}.env
test-envvars:
	@[ "${env}" ] || (echo "env var ins not set"; exit 1)

build:
	yarn run bundle

all:build
	aws s3 cp dist/ s3://${${env}_S3_BUCKET} --recursive && aws cloudfront create-invalidation \
	 --distribution-id ${${env}_DISTRIBUTION_ID} \
	  --paths "/*"

# 1. remove everything from ./dist
# 2. increment the version in package.json
# 3. override .env VITE_IFRAME_URL to point to production
# 4. yarn bundle
# 5. npm publish
# 6. override .env VITE_IFRAME_URL to point to dev
# 7. yarn bundle
# 8. npm publish (to dev-sdk)