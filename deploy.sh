yarn generate
cd .output/public/
git init
git add .
git commit -m "deploy"
git push -f https://github.com/nomppy/nomppy.github.io.git main:gh-pages
cd ..
