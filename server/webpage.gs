const doGet=()=>{
  const html = HtmlService.createTemplateFromFile('src/main')
  html.currentUserEmail = Session.getActiveUser().getEmail()
  return html.evaluate()
}

function require(filePath){
  let [folderName,fileName] = filePath.split('/')

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
    
  }

}

function include(filePath=''){
  var [folderName,fileName] = filePath.split('/')
  if(folderName==='App')fileName='App'

  if(folderName==='stores'){
    return HtmlService.createHtmlOutputFromFile(`src/stores/${fileName}`).getContent()
  }

  if(folderName==='components' && fileName==='Index'){
    const content = HtmlService.createHtmlOutputFromFile(`src/components/Index`).getContent()
    const res = content.replaceAll('<template','<script').replaceAll('template>','script>')
    return res
  }

  {
    const content = HtmlService.createHtmlOutputFromFile(`src/${fileName==='App'? 'App':folderName+'/'+fileName}`).getContent()
    const res = content
      .replace(/<template>\n/,`<script type="text/x-template" id="${fileName.toLowerCase()}">`)
      .replace(/<\/template>\n\n<script>/,'</script>  <script>')
    return res    
  }
}