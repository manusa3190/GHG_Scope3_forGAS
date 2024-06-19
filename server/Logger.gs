class Logger {

  static log(content){
    const ログsheet = SpreadsheetApp.openById(ログid).getActiveSheet()

    const toString = Object.prototype.toString
    const type = toString.call(content).slice(8, -1).toLowerCase();

    if(type==='object' || type==='array'){
      content = JSON.stringify(content)
    }

    ログsheet.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      content
    ])
  }
}