#Made by Frostbourne

#Read env-prod or env-dev.txt based on command line flag
# python publish.py --dev
# python publish.py --prod
# python publish.py --all

# Cache user's .env to env-user.txt
# Set .env to the appropriate txt
# Increment package version
# Allow options for incr --major --minor --patch (default) or not --same-ver
# Run yarn bundle 
# Replace .env with cached .env
# Run npm publish --access public

import argparse
import subprocess
import re
import sys

from os import path, remove, makedirs, getcwd, pardir

parser = argparse.ArgumentParser(
	prog = 'publish.py',
	description = 'String SDK Publisher')

parser.add_argument("-p", "--prod", action="store_true", help="Publish to prod")
parser.add_argument("-d", "--dev", action="store_true", help="Publish to dev")
parser.add_argument("-a", "--all", action="store_true", help="Publish to both dev and prod")
parser.add_argument("-u", "--use-env", action="store_true", help="Use sensitive vars from .env")
parser.add_argument("-s", "--same-ver", action="store_true", help="Don't automatically increment version")

verRegex = re.compile(r'(?<="version": ")(.*)(?=")')
nameRegex = re.compile(r'(?<="name": ")(.*)(?=")')

prodName = "@stringpay/sdk"
devName = "@stringpay/sdk-dev"

sensitiveVars = ["VITE_ANALYTICS_LIB_PK="]

useEnvSensitiveVars = False
shouldIncrVer = True

parentDir = path.abspath(path.join(getcwd(), pardir))

def cacheEnv():
	if path.isfile("backup/env-user.txt"):
		print("Skipping .env cache")
	else:
		print("Caching user .env")
		with open("../.env", "r") as userenv:
			with open("backup/env-user.txt", "w") as cache:
				cache.write(userenv.read())

def removeCache():
	print("Applying and removing .env cache")
	with open("../.env", "w") as userenv:
		with open("backup/env-user.txt", "r") as cache:
			userenv.write(cache.read())

	remove("backup/env-user.txt")

def resetPkgName():
	with open("../package.json", "r+") as pkg:
		lines = pkg.read()
		pkg.seek(0)

		lines = nameRegex.sub(prodName, lines)

		pkg.write(lines)
		pkg.truncate()

def setEnv(flag):
	print(f"Setting .env to env-{flag}")
	with open(f"env-{flag}.txt", "r") as env:
		lines = env.readlines()
		env.seek(0)

		# Check for missing env vars
		for i, line in enumerate(lines):
			line = line.strip()
			if line.startswith("VITE_"):
				eqIdx = line.find("=")
				if not line[eqIdx + 1:]:
					if useEnvSensitiveVars:
						with open("../.env", "r") as userenv:
							for userEnvLine in userenv.readlines():
								userEnvLine = userEnvLine.strip()
								if userEnvLine.startswith(line[:eqIdx]):
									lines[i] = userEnvLine
					else:	
						raise Exception(f"Missing {line[:eqIdx]} in env-{flag}.txt")

		with open("../.env", "w") as userenv:
			userenv.writelines(lines)

def expungeSensitiveVars(flag):
	print(f"Removing sensitive data from env-{flag}.txt")
	with open(f"env-{flag}.txt", "r+") as env:
		lines = env.readlines()
		env.seek(0)

		for i, line in enumerate(lines):
			for var in sensitiveVars:
				if line.startswith(var):
					lines[i] = var + "\n"
		env.writelines(lines)
		env.truncate()

def incrVer(ver):
	nums = [int(n) for n in ver.split(".")]
	if nums[2] < 9:
		nums[2] += 1
	elif nums[1] < 9:
		nums[1] += 1
		nums[2] = 0
	elif nums[0] < 9:
		nums[0] += 1
		nums[1] = 0
		nums[2] = 0
	else:
		raise Exception("Unknown versioning scheme")

	return ".".join([str(n) for n in nums])


def updatePkg(flag):
	global shouldIncrVer

	with open("../package.json", "r+") as pkg:
		lines = pkg.read()
		pkg.seek(0)

		with open("backup/package.json.old", "w+") as backup:
			backup.write(lines)

		if shouldIncrVer:
			currentVer = verRegex.search(lines)
			if (currentVer):
				currentVer = currentVer.group(1)
				newVer = incrVer(currentVer)
				print(f"Incrementing package.json version from {currentVer} to {newVer}")
				lines = verRegex.sub(newVer, lines)
				shouldIncrVer = False
			else:
				raise Exception("Could not get version")
		else:
			print("Using current version in package.json")

		newPkgName = prodName if flag == "prod" else devName
		lines = nameRegex.sub(newPkgName, lines)

		pkg.write(lines)
		pkg.truncate()

def bundle():
	subprocess.run(["yarn", "bundle"], cwd=parentDir)

def publishNPM(dryrun = True):
	npmargs = ["npm", "publish"]
	npmargs.extend(["--dry-run"] if dryrun else ["--access", "public"])

	subprocess.run(npmargs, cwd=parentDir)
	
	if dryrun:
		response = input("Would you like to publish for real? (y/n): ")

		if response.lower() == "y":
			publishNPM(dryrun = False)
		else:
			print("Ok, not publishing")

def publishProd():
	print("--------Publishing to " + prodName)
	cacheEnv()
	setEnv("prod")
	updatePkg("prod")
	bundle()
	removeCache()
	publishNPM()

def publishDev():
	print("--------Publishing to " + devName)
	cacheEnv()
	setEnv("dev")
	updatePkg("dev")
	bundle()
	removeCache()
	publishNPM()
	resetPkgName()

def main():
	if len(sys.argv) < 2:
		parser.print_help()
		sys.exit(1)
	
	args = parser.parse_args()

	global shouldIncrVer
	global useEnvSensitiveVars

	if (args.same_ver):
		shouldIncrVer = False

	if (args.use_env):
		useEnvSensitiveVars = True
	
	makedirs("backup/", exist_ok=True)

	if (args.prod):
		publishProd()
	elif (args.dev):
		publishDev()
	elif (args.all):
		publishDev()
		publishProd()

	expungeSensitiveVars("prod")
	expungeSensitiveVars("dev")

	print("Thanks for using the Automated String SDK Publisher")
main()
