SRC_DIR = src
BUILD= cat
SRC_FILES = ${SRC_DIR}/Undoable.js\
${SRC_DIR}/UndoableList.js\
${SRC_DIR}/Element.js\
${SRC_DIR}/Node.js\
${SRC_DIR}/Root.js\
${SRC_DIR}/Renderer.js
TARGET_FILES = sketchitLib.js

all: ${TARGET_FILES}
	
sketchitLib.js: ${SRC_FILES}
	${BUILD} $^ > $@

clean: 
	rm ${TARGET_FILES}

