const doGet=()=>{
  const html = HtmlService.createTemplateFromFile('src/main')
  html.currentUserEmail = Session.getActiveUser().getEmail()
  return html.evaluate()
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