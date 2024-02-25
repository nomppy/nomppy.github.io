yarn generate
cd generate/
git init
git add .
git commit -m "deploy"
git push -f https://github.com/nomppy/nomppy.github.io.git main:gh-pages
cd ..
