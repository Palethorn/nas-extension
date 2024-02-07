# Welcome
New, and completely rewritten extension for enabling browsers to play adaptive streams natively like it woud open mp4 or 
HLS on Safari.</br>
Extension was created purely from the need to easily test and preview HTTP streams using simple mouse click.

# Disclaimer

<br/>
I'm a lone developer on this project, and I have a day job as a software developer which consumes most of my time. I spend the rest of my time either pursuing other 
hobbies, spending time with my family, or handling life obligations. That means mostly avoiding stuff related to my work as a developer. Because of that my response and development is slow. Any development I do on this project is
for the satisfaction of giving back to the community which helped me do my job in the first place. If not for that, I would not have published the extension to any major web stores.<br/>
<br/>
The extension is what it is. I may refactor it, rename it, rebrand it, or I may not.<br/>
<br/>
I will try to fix any bugs if I can reproduce them. There are lot of test cases out there and I do not have time to prepare test streams for each of them.
I would appreciate if you could provide as many details as you can when reporting a ticket, and provide a sample stream for which you believe the player 
has a problem with.<br/>
<br/>
Still want to shout out to [ghouet](https://github.com/ghouet) who started the original project and kickstarted what has become today.<br/>
Shout out to all the developers, maintainers, testers and contributors of the [hls.js](https://github.com/video-dev/hls.js) 
and [dash.js](https://github.com/Dash-Industry-Forum/dash.js) project who keep it going.<br/>
<br/>

And thanks everyone who donated, keeps me floating.<br/>


# Native HLS + MPEG-Dash Extension
Allows HLS and MPEG-Dash native playback in chrome and firefox browsers

# Usage
1. Install extension from [chrome webstore](https://chrome.google.com/webstore/detail/native-mpeg-dash-%2B-hls-pl/cjfbmleiaobegagekpmlhmaadepdeedn)/[mozilla addons](https://addons.mozilla.org/en-US/firefox/addon/native-mpeg-dash-hls-playback/)
2. Click on any m3u8 or mpd link inside chrome/firefox to play it directly in a new tab

The extension can be disabled by clicking on the icon if the request filter on m3u8 links is too disruptive.

# Possible issues
## Regarding migration to Manifest V3
Chrome forces extensions to migrate to a new manifest version. I wanted to do this for a long time but I always 
stumble on some kind of problem. In short, new extensions must use declarativeNetRequest for handling blocking 
HTTP requests. This extension uses regexFilter now, with a redirect action. Old extension was used simple string 
processing to determine whether it should redirect a user to a player or not. This was very reliable since the 
URL could be split and analyzed to make a choice. The new extension is relying in a regex pattern to detect a 
streaming URL, and this is very finicky in my opinion because nothing short of a very greedy regex would work 
reliable enough. That means it captures the manifest.mpd, for example, if you type it in on some search engine 
and then it improperly redirects. In time I may devise a better pattern but for now if this happens just click 
on the Disable DNR on the extension menu.

Alternatively, you can head on to the options and try to edit the DNR rules yourself. Disabling DNR only 
disables redirection using left click. I've added context menus for links and selections which you can use 
instead.

It's also been interesting to comply with the firefox side of things, with the adding of dynamic rules and 
regarding their permissions and security. In my tests firefox just blocks the request for now and requires 
additional manual navigation to redirect the URL. It also required me to manually enable all permissions on 
extension options, which I hope won't be necessary when I publish the extension, but I will test it some more.

# Build instructions
Requirements:
    - node
    - angular-cli

> npm i

> npm run build 

or for development 

> ng serve

If you want to modify the extension while loaded in browser

> npm run watch

Load unpacked extension to Firefox:
 - Type in about:debugging into address bar
 - Click Load Temporary Add-on
 - Navigate to /project_path/dist/nas-extension/manifest.json

Load unpacked extension to Chrome:
 - Type chrome://extensions/ into address bar
 - Click Load Unpacked
 - Navigate to /project_path/dist/nas-extension
 - Click Open

# Some Developer Notes

By default, the browser downloads any m3u8 and mpd files that were requested. This plugin checks any links to see if
they match.
If that's the case, it opens a new tab on a video player that uses the [hlsjs][] and [dashjs][] library. This extension
is just a wrapper for those players on a modern browser.

[hlsjs]: https://github.com/dailymotion/hls.js
[dashjs]: https://github.com/Dash-Industry-Forum/dash.js

#License
Released under [MIT License](LICENSE)
