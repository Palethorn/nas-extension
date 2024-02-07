var dnrEnabled = true;

var extension_page = chrome.runtime.getURL('/index.html');
var substitution = extension_page + "#\\0"

var defaultDnrRules = [{
  id: 1,
  action: {
    type: 'redirect',
    redirect: { regexSubstitution: substitution },
  },
  condition: {
    regexFilter: '^https?://.*/.*\\.m3u8(\\?.*)?',
    resourceTypes: ['main_frame', 'sub_frame'],
  },
}, {
  id: 2,
  action: {
    type: 'redirect',
    redirect: { regexSubstitution: substitution },
  },
  condition: {
    regexFilter: '^https?://.*/.*\\.mpd(\\?.*)?',
    resourceTypes: ['main_frame', 'sub_frame'],
  },
}, {
    id: 3,
    action: {
      type: 'redirect',
      redirect: { regexSubstitution: substitution },
    },
    condition: {
      regexFilter: '^https?://.*/.*/Manifest(\\?.*)?',
      resourceTypes: ['main_frame', 'sub_frame'],
    },
}, {
    id: 4,
    action: {
      type: 'redirect',
      redirect: { regexSubstitution: substitution },
    },
    condition: {
      regexFilter: '^https?://.*/.*\\.m3u(\\?.*)?',
      resourceTypes: ['main_frame', 'sub_frame'],
    },
}];

function onClick(info) {
    if('link' == info.menuItemId) {
        chrome.tabs.create({ 'url': extension_page + "#" + info.linkUrl }, function (tab) { });
    }

    if('link-text' == info.menuItemId) {
        chrome.tabs.create({ 'url': extension_page + "#" + info.selectionText }, function (tab) { });
    }
}

chrome.contextMenus.onClicked.addListener(onClick);

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
      defaultDnrRules: defaultDnrRules
    }, function() {
      console.log('Default rules saved to local storage');
    });

    setDefaultDnrRules();

    chrome.contextMenus.create({
        title: 'Open in Native MPEG-Dash + HLS Playback',
        contexts: ['link'],
        id: 'link',
        targetUrlPatterns: [
            '*://*/Manifest*',
            '*://*/*.mpd*',
            '*://*/*.m3u*',
            '*://*/*.m3u8*'
        ]
    });

    chrome.contextMenus.create({
        title: "Open in Native MPEG-Dash + HLS Playback", 
        contexts:["selection"],
        id: 'link-text'
    });

    chrome.tabs.create({ 'url': chrome.runtime.getURL('release_notes.html') });
});

console.log('adding message receiver');

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

    if('get-dnr-state' == request.type) {
        sendResponse({ dnrEnabled: dnrEnabled });
    }

    if('reset-dnr-rules' == request.type) {
        setDefaultDnrRules();
    }

    if('disable-dnr-rules' == request.type) {
        chrome.storage.local.set({
            dnrEnabled: false
        });

        dnrEnabled = false;
        removeDnrRules();
    }

    if('enable-dnr-rules' == request.type) {
        chrome.storage.local.set({
            dnrEnabled: true
        });

        dnrEnabled = true;
        reloadDnrRules();
    }

    if('set-custom-dnr-rules' == request.type) {
        setCustomDnrRules(request.rules);
    }

    return true;
});

async function setDefaultDnrRules() {
    console.log("Resetting DNR Rules");

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log(oldRules);
    
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRules.map((rule) => rule.id),
        addRules: defaultDnrRules,
    });

    const newRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log(newRules);
}

async function setCustomDnrRules(customDnrRules) {
    console.log(customDnrRules);

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();

    if(customDnrRules) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRules.map((rule) => rule.id),
            addRules: customDnrRules,
        });
    } else {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRules.map((rule) => rule.id),
            addRules: defaultDnrRules,
        });
    }

    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log(currentRules);
}

async function reloadDnrRules() {
    chrome.storage.local.get({
        customDnrRules: []
    }, async (items) => {
        if(items.customDnrRules && items.customDnrRules.length)  {
            setCustomDnrRules(items.customDnrRules);
        } else {
            setDefaultDnrRules();
        }

        const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
        console.log(currentRules);
    });
}

async function removeDnrRules() {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();

    chrome.declarativeNetRequest.updateDynamicRules(chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRules.map(r => r.id)
    }));

    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log(currentRules);
}

chrome.storage.local.get({
    dnrEnabled: true
}, function(items) {
    dnrEnabled = items.dnrEnabled;
})