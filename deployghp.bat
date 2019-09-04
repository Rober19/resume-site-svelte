@echo off
call npm run build
git add public -f && git commit -m "deploy gh-pages"
REM git push origin --delete gh-pages
git subtree push --prefix public origin gh-pages