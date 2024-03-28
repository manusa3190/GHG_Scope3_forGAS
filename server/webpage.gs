const doGet=()=>{
  const html = HtmlService.createTemplateFromFile('src/main')
  html.currentUserEmail = Session.getActiveUser().getEmail()
  return html.evaluate()
}

function include(fileName=''){
  if(!fileName.startsWith('components')){
    const content = HtmlService.createHtmlOutputFromFile(`src/${fileName}`).getContent()
    const res = content
      .replace(/<template>\n/,`<script type="text/x-template" id="${fileName}">`)
      .replace(/<\/template>\n\n<script>/,'</script>  <script>')
    return res    
  }else{
    const content = HtmlService.createHtmlOutputFromFile(`src/components`).getContent()
    const res = content.replaceAll('<template','<script').replaceAll('template>','script>')
    return res    
  }
}