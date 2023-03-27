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

# structure of the github repository
If you're going to build off my work, it would be helpful to know how it works. If you navigated to the [21-22 repo](https://github.com/couch-crew/21-22), this is the file directory that you would see:
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

For the purposes of replicating this project, we will only be working with `_projects/` and `assets/`. The following section delves a little deeper on each of those subdirectories.

# Anatomy of a project
Every project consists of just 2 files:
1. A Markdown file (`.md`), containing written responses, project description, etc. 
2. A picture representing the project, such as a logo, in jpg format

## Project files are written in Markdown
### What is Markdown?
If you've never used Markdown, this may seem daunting, but there's nothing to be afraid of! At its core, Markdown allows you to format your text (**bold**, _italic_, etc.) just like you would in a Google Doc or Microsoft Word. It's super simple to get started and easy to master. Many guides exist on the internet for Markdown ([Markdown Guide](https://www.markdownguide.org/getting-started/#flavors-of-markdown)).

### Example project file
Let's look at an example from this year's project submissions: [Alarmo](https://couch-crew.github.io/21-22/alarmo).
This is the Markdown file ([view the file on Github](https://github.com/Couch-Crew/21-22/blob/main/_projects/alarmo.md?plain=1)):
```
---
title: "Alarmo"
pos: [["27%", "47%"], ["13%", "46%"]]
creators: ["Rayyan Zahir", "Ribal Dakhallah"]
orientation: up
pic: 2
---

# brief
Alarmo is a preasure sensitive pad that sits under your mattress. It will ring at the time set. And it won't turn off until the user gets off of the bed. 

## Why are you doing this project?
To help people wake up on time! We realized we were having a lot of trouble with waking up on time for school. And for that reason, it seemed like the most relevant problem to us. 

## Who did what?
We both worked on most things together. I was usually in charge of coding the Arduino. Where as Ribal was usually in charge of wiring the entire thing. We've gotten a lot of help from Amr, so a lot of times we'll all work on one thing together at the same time.

## What was your biggest challenge?
Learning C++ and learning how to circuit a bread board.

## What was your biggest succcess?
Finishing our website helped give us somewhat of an official feeling, that this idea could go places. But the largest successes so far have been small things that we've been able to do with the Arduino. Like getting LEDs to light up or the buzzr to make noise.
```
As you can see, there isn't much to it!

At the top of the file, encloesd between the triple dashes (---), is the [YAML Frontmatter](https://assemble.io/docs/YAML-front-matter.html). The frontmatter of Markdown files is used to contain information about the file itself, or **metadata**.
The frontmatter of this file contains information on the `title`, `pos` (short for position), `creators`, `orientation`, and `pic` (picture) of the file.

`title` is just the name of the project. `pos` indicates to the code where on the picture a project should point to. `creators` contains the name(s) of the people who worked on the project. `orientation` indicates whether the project bubble should point up or down. `pic` indicates which picture the project should be linked to.

# Steps to replicate
Essentially, you will make a copy of the existing `21-22` repository and update the photos and project files.

### 1 &mdash; get added to the Github organization
You need to join the organization before you can create a new repository. Fill out [this Google form]() to be added. [Sign up](https://github.com/signup) for a Github account if you don't have one.

### 2 &mdash; fork the repository
Navigate to the [21-22 repository]() and click "fork". On the new page, make sure "owner" is set to "Couch-Crew" and change the repository name to be whatever year you're setting this up for. Create the repository.

### 3 &mdash; collect pictures and project files


### 4 &mdash; update year, pictures, project files
Go into `index.html` in the root directory. At the top of the page, change `title: 2021&ndash;2022` to be whatever academic year it is.