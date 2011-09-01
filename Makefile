SRC_PATH = "src"
LIB_PATH = "./lib/"


# update the submodules to the latest at the most logical branch
pull_submodules:
	git submodule foreach "git pull"
	git submodule summary

pull: pull_submodules
	git pull