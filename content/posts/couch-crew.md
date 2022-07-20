---
title: Couch Crew replication guide
description: A step-by-step guide on using my website for the Incubator as a template for future Incubator classes.
category: misc.
tags: ['web', 'guide']
confidence: certain
status: notes 
start:
end:
---

This post is a walkthrough of a project for a high school class. The [project website](https://couch-crew.github.io/21-22). [Github link](https://github.com/couch-crew/21-22). Minimal coding knowledge is required to replicate the project for future classes.

# Structure of the website
*This isn't required knowledge. If you just want the steps to replicate, skip to [steps to replicate]().*

Github provides [static website](https://www.sanity.io/what-is-a-static-site) hosting via [Pages](https://pages.github.com). Github allows each **user** or **organization** to host a website at `<username>.github.io`, as well as a website for each repository with an URl of `<username>.github.io/<repository_name>`. Technically speaking, Github allocates a [subdomain]() (`<username>.github.io`) to every user/organization, and it allows you to host respository websites at routes of the subdomain.

It is this organization/repository hosting structure that makes Couch Crew easy to replicate and modify. 

The organization I've created on Github is called "Couch-Crew", which gives us the `couch-crew` subdomain. Each repository, named according to the year of the class, e.g. 21-22, 22-23... then gets an URL corresponding to their name. This means that creating a new class page is as simple as duplicating the existing `21-22` repo and swapping out the pictures and images.

## structure of the repo
If you're going to build off my work, it would be helpful to know how it works. If you navigated to the (21-22 repo)[https://github.com/couch-crew/21-22], this is the file directory that you would see:
```
.
├── .bundle/
├── _includes/
├── _layouts/
├── _projects/
├── assets/
├── css/
├── .DS_Store
├── .gitignore
├── 404.html
├── Gemfile
├── Gemfile.lock
├── _config.yml
└── index.html
```
Let's briefly go through what each of these directories and files do:
- **index.html**: This is what is displayed by the browser when we navigate to `couch-crew.github.io/21-22`.
- **_includes/**: Contains snippets of HTML code that can be reused throughout the site. [Jekyll documentation](https://jekyllrb.com/docs/includes/).
- **_layouts/**: Contains HTML templates that pages can use to minimize repeating code. [Jekyll documentation](https://jekyllrb.com/docs/layouts/).
- **_projects/**: Contains Markdown files of each student's project.
- **assets/**: Stores documents like class pictures, student project logos, and other media files that the site might need to use.
- **css/**: Holds CSS files, which are code that change how elements on a website look.

