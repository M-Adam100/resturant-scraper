document.querySelector('#articles').addEventListener('change',(e) => {
    chrome.storage.local.set({ number: document.querySelector('#articles').value})
})

document.querySelector('#Save').addEventListener('click',(e) => {
  chrome.storage.local.set({
    number: document.querySelector('#articles').value
  })
})

document.querySelector('#Start').addEventListener('click', () => {
    const query = { active: true, currentWindow: true };
    function callback(tabs) {
        const currentTab = tabs[0]; 
        chrome.scripting.insertCSS(
          {
            target: {tabId: currentTab.id},
            files: ["styles/style.css"]
          },
          () => { console.log('CSS Injected') });
        chrome.scripting.executeScript(
            {
              target: {tabId: currentTab.id},
              files: ['scripts/save-articles.js']
            },
            () => { console.log("Executed Script")});
      }

    chrome.tabs.query(query, callback);
})

const setUI = () => {
  chrome.storage.local.get(['number'], CS => {
    if (CS.number) document.querySelector('#articles').value = CS.number;
  })
}

setUI();








