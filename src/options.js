function saveOptions() {
    var maxQuality = document.querySelector('#maxQuality').checked;
    var customDnrRules = JSON.parse(document.querySelector('#dnr-rules').value);

    chrome.storage.local.set({
        maxQuality: maxQuality,
        customDnrRules: customDnrRules
    }, function() {
        chrome.runtime.sendMessage({ type: 'set-custom-dnr-rules', rules: customDnrRules });

        var status = document.getElementById('status');
        status.value = 'Options saved.';

        setTimeout(function() {
        status.value = '';
        }, 750);
    });
}

function restoreOptions() {
    console.log('restoreOptions');

    chrome.storage.local.get({
        maxQuality: false,
        customDnrRules: [],
        defaultDnrRules: []
    }, function(items) {
        document.getElementById('maxQuality').checked = items.maxQuality;

        if(items.customDnrRules.length > 0) {
            console.log("why");
            document.querySelector('#dnr-rules').value = JSON.stringify(items.customDnrRules, null, 2);
        } else if(items.defaultDnrRules.length > 0) {
            console.log("wat");
            document.querySelector('#dnr-rules').value = JSON.stringify(items.defaultDnrRules, null, 2);
        }
    });
}

function resetDnrRules() {
    console.log("Resetting DNR Rules");
    chrome.storage.local.set({
        customDnrRules: []
    });
    
    chrome.storage.local.get({
        defaultDnrRules: []
    }, function(items) {
        document.querySelector('#dnr-rules').value = JSON.stringify(items.defaultDnrRules, null, 2);
        chrome.runtime.sendMessage({ type: 'reset-dnr-rules' });
    });
}

function attachEventListeners() {
    restoreOptions();
    document.getElementById('saveSettings').addEventListener('click', saveOptions);
    document.getElementById('reset-dnr-rules-btn').addEventListener('click', resetDnrRules);
}

attachEventListeners();
