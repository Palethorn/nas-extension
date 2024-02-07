var current_version = "0.8.2"

var btnUpdate = document.getElementById('btnUpdate');
btnUpdate.addEventListener('click', updateState);

chrome.runtime.sendMessage({ type: 'get-dnr-state' }, (response) => {
    if(!response) {
        return;
    }

    console.log(response);
    btnUpdate.innerText = response.dnrEnabled ? 'DISABLE DNR' : 'ENABLE DNR';
});

function updateState() {
    if (btnUpdate.innerText == 'ENABLE DNR') {
        chrome.runtime.sendMessage({ type: 'enable-dnr-rules' });
        btnUpdate.innerText = 'DISABLE DNR';
    } else {
        chrome.runtime.sendMessage({ type: 'disable-dnr-rules' });
        btnUpdate.innerText = 'ENABLE DNR';
    }
}

document.getElementById('btnSettings').addEventListener('click', () => {
	chrome.runtime.openOptionsPage();
});

document.getElementById('btnApp').addEventListener('click', () => {
    chrome.tabs.create({ 'url': "/index.html#" });
});
