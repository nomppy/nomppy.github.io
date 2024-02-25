---
title: CrowdCam (SpartaHack9)
description: Facial Rekognition // Crowd-sourcing event images from participants
category: blogs
status: finished
start: 2024-01-28
end: 2024-01-28
---

Heya!<br>
This is a super quick blog post about [SpartaHack9](https://spartahack.com/), which I just came back from. 
I wanted to do a superquick writeup of my team's project, because I think it's interesting and also because I kind of want to keep working on it. 

(And because if I want to recruit more people to help me out it's easier to send them a blog then a chain of texts.)


## Introduction

CrowdCam [(devpost)](https://devpost.com/software/crowdcam) is a platform to help people find pictures of themselves that other people might have taken of them. 

The core idea behind the app is this: 
1. Thing happens (5k, hackathon, concert, birthday party, etc.)
2. People (e.g. photographers, trigger-happy instagram teens) can upload pictures they took to the website. We run AWS's [Rekognition](https://aws.amazon.com/rekognition/) to detect faces
3. Anyone interested can upload a picture of themself and receive all images that they appeared in.

We have a functioning (mostly) demo at [crowdcam.club](https://crowdcam.club/).


## To-do's

Currently the app looks like this

### TODO PUT IMG HERE

There's a couple things I want to do:
1. Make a big, comfy desktop UI. Think Pinterest. 
    1. Implement as part of this the ability to fetch and display _all_ images from an event
    2. Pick a more official-sounding name, like Crowcam, where the logo can now also be more special
2. Add user system, most likely just oauth
3. Implement an optimization on the AWS end that we weren't able to get working during the hackathon, to speed up queries for faces 
4. More robust event creation/search, ties it to 1. a bit and again the analogy is like Pinterest boards
5. Market the platform, with the eventual possibility of adopting to mobile apps
6. Other things further down the line:
    1. Add support for video files (Rekognition has this, I think the major difficulty would be in handling the file/optimizing runtime)
    2. Add support for people to opt out of the search by, as a possible example,uploading a picture of their face to a special URL, after which we blur them out in all media we receive (possiblyy retroactively blurring them out in all _existing_ media as well)
    

## Why you should help

I think this is genuinely a pretty good idea that I can see myself use. 
Sure, is it a lot better than just dumping all the photos into a group chat? Probably not, but for larger events, like sports, and other outdoor things, putting everything in a Google Drive seems less feasible.

One of the main appeals is to have a cloud-hosted, dedicated media highlight album for every event. 
Actually, this is useful even in smaller group settings, because you rarely have the organizational capability. 
Plus, there's an exciting avenue for publicly-available "albums" so that people can search for an event and see it from an extremely diverse set of viewpoints

Potential applications, in sum:
1. Easy-to-access group memories within small groups
2. In medium-to-large sized groups, makes picking yourself (or your friends, feasibly) out a lot easier
3. Changeable privacy setting means that it can act as a well-represented image database for huge public events, obviously input validation would be something to tackle here

It's kind of like a Pinterest meets Google Photos meets Twitter, if that makes sense.



