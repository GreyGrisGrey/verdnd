call npx @biomejs/biome format --write
python compile.py
call tsc -p ./server/tsconfig.json
call tsc -p tsconfig.json
start npx http-server
start http://47.55.46.138:4321/
node serveOut.js
timeout 3000