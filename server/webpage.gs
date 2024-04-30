const doGet=()=>{
  const html = HtmlService.createTemplateFromFile('src/main')
  html.currentUserEmail = 'yuta.ueda@kobayashi.co.jp' //Session.getActiveUser().getEmail()
  return html.evaluate()
}

function require(filePath){
  let [folderName,fileName] = filePath.split('/')

  if(filePath==='App')fileName='App'

  const content = HtmlService.createHtmlOutputFromFile('src/' + filePath).getContent()

  if(content.includes('defineComponent')){
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)

    if(!templateMatch)return

    const template = '`' + templateMatch[1] + '`'

    const componentMatch = content.match(/defineComponent\(([\s\S]*?)<\/script>/)

    if(!componentMatch)return

    let component = componentMatch[0]

    component = component.replace('})\n\n</script>',`,template:${template} })\n`)
    component = `const ${fileName} =` + component

    return component
  }

  if(content.includes('defineStore')){
    const storeMatch = content.match(/defineStore([\s\S]*?)<\/script>/)

    if(!storeMatch)return

    const store = `const ${fileName} = defineStore` + storeMatch[1]

    return store
  }

}