function saveOptions() {
    var customDnrRules = JSON.parse(document.querySelector('#dnr-rules').value);

    chrome.storage.local.set({
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
        customDnrRules: [],
        defaultDnrRules: []
    }, function(items) {

        if(items.customDnrRules.length > 0) {
            document.querySelector('#dnr-rules').value = JSON.stringify(items.customDnrRules, null, 2);
        } else if(items.defaultDnrRules.length > 0) {
            document.querySelector('#dnr-rules').value = JSON.stringify(items.defaultDnrRules, null, 2);
        }
    });
}

function resetDnrRules() {
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
