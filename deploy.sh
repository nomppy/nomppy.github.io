yarn generate
cd .output/public/
touch .nojekyll
git init
git add .
git commit -m "deploy"
git push -f https://github.com/nomppy/nomppy.github.io.git main:gh-pages
cd ..
