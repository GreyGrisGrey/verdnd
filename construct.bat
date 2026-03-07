call npx @biomejs/biome format --write
python compile.py
call tsc -p tsconfig.json
start python ./server/tempServe.py
start npx http-server
start http://192.168.2.142:8080
timeout 30