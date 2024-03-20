ENV = 'DEV'

const useRuntimeConfig = (key) => globalThis[key+'_'+ENV]

const lock = LockService.getScriptLock()

function get自所属users(){
  const currentUserEmail = Session.getActiveUser().getEmail()
  const 従業員マスタ = new Sheet({spreadsheetId:useRuntimeConfig('従業員マスタ'),key列名:'E-Mail'})
  const currentUser = 従業員マスタ.docs[currentUserEmail]
  if(!currentUser)throw('ユーザー情報が見つかりません')
  const 自所属users = 従業員マスタ.items
      .filter(item=>item['AD_所属名']===currentUser['AD_所属名'])
      .map(item=>({
        メールアドレス:item['E-Mail'],
        従業員名:item['AD_氏名'],
        所属名:item['AD_所属名'],
      }))

  return 自所属users
}

function get自所属の原資材(所属名){
  const {items:原資材マスタitems} = new Sheet({spreadsheetId:useRuntimeConfig('原資材調査'),sheetName:'原資材マスタ'})
  原資材マスタitems.filter(item=>item['担当部署名']===所属名)
  return 原資材マスタitems
}

function get原資材and構成(品目コード){
  const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
  const {docs:原資材マスタdocs} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'原資材マスタ'})
  const {items:構成マスタitems} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成マスタ'})
  
  const 品目item = 原資材マスタdocs[品目コード]
  if(!品目item)throw(`${品目コード}の品目が見つかりません`)
  const 構成 = 構成マスタitems.filter(item=>item['構成コード']===品目item['構成コード'])

  return {構成:構成,...品目item}
}

function set原資材(item){
  try{
    const {構成:構成items,構成コード} = item
    delete item['構成']
    lock.waitLock(10000)
    const 原資材調査 = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 原資材マスタ = new Sheet({spreadsheet:原資材調査,sheetName:'原資材マスタ'})
    if(!構成コード){
      const 構成マスタ = new Sheet({spreadsheet:原資材調査,sheetName:'構成マスタ'})
      const 構成コード = 構成マスタ.getNewId()
      item['構成コード']=構成コード
      構成items.forEach(構成item=>構成item['構成コード']=構成コード)
      構成マスタ.setItems(構成items)
    }
    原資材マスタ.setItem(item)
    return item
  }catch(err){
    throw('NG')
  }finally{
    lock.releaseLock()
  }
}

function set構成(){
  const 構成マスタ = new Sheet({spreadsheetId:useRuntimeConfig('原資材調査'),sheetName:'原資材マスタ'})
  原資材マスタ.setItem(item)
}

function delete構成(){
  
}