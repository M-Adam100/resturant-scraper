console.log('Running Script')

(async () => {
  const loader = document.createElement('div')
  loader.className = 'loader'
  loader.id = 'nihao-loader'
  let pageNum = 1
  const { number } = await chrome.storage.local.get(['number']);

  if (!document.querySelector('#nihao-loader')) {
    document.querySelector('body').appendChild(loader)
  }

  function decodeHTMLEntities(str) {
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '')
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, '')
      element.innerHTML = str
      str = element.textContent
      element.textContent = ''
    }

    return str
  }

  const ARR = [];
  let total = 0
  const coverArticles = async (pins) => {
    for (let i = 0; i < pins.length; i++) {
      try {
        const item = pins[i];
        const href = item.querySelector('a').href
        const productResponse = await fetch(href)
        const productResponseText = await productResponse.text()
        let re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm
        let match
        let articleData
        let j = 0;
        while ((match = re.exec(productResponseText))) {
          j++
          let data = match[1].replace(/\s+/g, '')
          if (data.includes('@context') && data.includes('reviewCount')) {
            articleData = JSON.parse(data)
          }
        }
        const parser = new DOMParser()
  
        const doc = parser.parseFromString(productResponseText, 'text/html')
  
        const rank = doc.querySelector('.AYHFM').querySelector('span');

        const email =  doc
        .querySelector('a[href*="mailto"]')
        ?.href.match('mailto:([^?]*)')[1];

        if (email) {
          ARR.push({
            'Resturant Name': doc.querySelector(
              'h1[data-test-target="top-info-header"]',
            )?.innerText || "N/A",
            Reviews: articleData?.aggregateRating?.reviewCount || "N/A",
            'Average Review Rating': articleData?.aggregateRating?.ratingValue || "N/A",
            Ranking: Number(rank
              ?.querySelector('b')
              .innerText.replaceAll('.', '')
              .replace('N', '')
              .replace('#', '')) || "N/A",
            'Total Resturants': rank?.innerText
              .split('di')
              .pop()
              .split('ris')[0]
              .trim()
              .replace('.', '') || "N/A",
            'Street Address': doc.querySelector('a[href*="MAP"]').innerText.split(',')[0].trim() || "N/A",
            'City':  doc.querySelector('.AYHFM').querySelector('span').innerText.split(' ').pop(),
            Email:
              doc
                .querySelector('a[href*="mailto"]')
                ?.href.match('mailto:([^?]*)')[1] || 'Email not present'
          })
        } else total--;
  
        console.log('Articles Parsed: ', ARR.length);
      } catch (error) {
        total--;
        console.log(error);
      }
    
    }

    if (ARR.length >= total ) {
      pageNum++;
      if (pageNum > Number(number)) {
        document.querySelector('#nihao-loader')?.remove();
        ARR.sort((a,b) => a.Ranking - b.Ranking); 
        exportPosts(ARR)
      } else {
        document.querySelector('a.nav.next').click();
        setTimeout(() => {
          pageTotal = 0;
          startWorking();
        }, 5000);
      }
     
    }
  }

  const startWorking = () => {
    if (true) {
      let articles = [
        ...document.querySelector('[data-test-target="restaurants-list"]')
          .children,
      ]

      articles = articles.filter((item) => !item.className);
      articles = articles.filter(item => !item.innerText.includes('Sponsorizzato'));
      total = total + articles.length
      console.log('Total Articles: ', total)
      const chunkSize = 4;
      for (let i = 0; i < articles.length; i += chunkSize) {
        const chunk = articles.slice(i, i + chunkSize);
        coverArticles(chunk);
       
      }
    }
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
  }

  const exportPosts = (arr) => {
    const items = arr
    if (items.length) {
      const replacer = (key, value) => (value === null ? '' : value)
      const header = Object.keys(items[0])
      const csv = [
        header.join(','),
        ...items.map((row) =>
          header
            ?.map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(','),
        ),
      ].join('\r\n')

      let link =
        document.querySelector(['[id="exportLink"]']) ||
        document.createElement('a')
      link.id = 'exportLink'
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURI(csv))
      link.setAttribute('download', `${window.location.href}.csv`)
      link.addEventListener('click', () => {
        console.log('Downloaded!')
      })
      link.click()
    }
  }

  startWorking()
})();
