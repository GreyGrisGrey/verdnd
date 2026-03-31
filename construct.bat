call npx @biomejs/biome format --write
python compile.py
call tsc components.ts
node components.js
call tsc -p ./server/tsconfig.json
call tsc -p tsconfig.json
start https://verdnd.ca/
node serveOut.js
timeout 3000