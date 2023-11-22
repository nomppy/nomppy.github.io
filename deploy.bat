@ECHO OFF
CALL yarn build

cd dist/
git init
git add .
git commit -m "deploy"
git push -f https://github.com/nomppy/nomppy.github.io.git master:gh-pages
cd ..
