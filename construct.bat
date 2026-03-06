call npx @biomejs/biome format --write
python compile.py
call tsc -p tsconfig.json
start python ./server/tempServe.py
start npx http-server
start http://47.55.46.138:4321
timeout 30