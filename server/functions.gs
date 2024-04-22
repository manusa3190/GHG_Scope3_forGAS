ENV = 'DEV'

const useRuntimeConfig = (key) => globalThis[key+'_'+ENV]

const lock = LockService.getScriptLock()

function get自所属users(){  
  const 従業員マスタ = new Sheet({spreadsheetId:useRuntimeConfig('従業員マスタ'),key列名:'E-Mail'})

  const currentUserEmail = Session.getActiveUser().getEmail()
  const currentUser = 従業員マスタ.docs[currentUserEmail]

  if(!currentUser)throw('currentUser所属名が見つかりません')

  return 従業員マスタ.items
      .filter(item=>item['AD_所属コード']===currentUser['AD_所属コード'])
      .map(item=>({
        従業員番号:item['従業員番号'],
        従業員名:item['AD_氏名'],
        所属名:item['AD_所属名'],
        メールアドレス:item['E-Mail'],
        isCurrentUser:item['E-Mail']===currentUserEmail
      }))
}

function get自所属原資材docs(){
  const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
  const {items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'原資材テーブル'})
  const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
  const {items:構成テーブルitems} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})

  const 自所属users = get自所属users()
  const myself = 自所属users.find(user=>user.isCurrentUser)
  const 自所属items = items.filter(item=>item['担当部署名']===myself['所属名'])

  const empty情報item = 情報テーブル.columns.reduce((obj,colName)=>Object.assign(obj,{[colName]:null}),{})
  自所属items.forEach(原資材item=>{ // 冗長な書き方であるが、スピードを優先している
      const {構成コード} = 原資材item
      if(構成コード){
        Object.assign(情報テーブル.docs[構成コード],原資材item)
        原資材item['構成'] = 構成テーブルitems.filter(item=>item['構成コード']===構成コード)
      }else{
        Object.assign(empty情報item,原資材item)
        原資材item['構成'] = []
      }
  })
  
  return 自所属items.reduce((docs,item)=>Object.assign(docs,{[item['品目コード']]:item}),{})
}

function get使いまわし情報docs(){
  const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
  let {items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
  let {items:構成items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})

  const 情報items = items
      .filter(item=>item['使いまわし'])
      .map(item=>{
        return {
          ...item,
          構成:構成items.filter(構成item=>構成item['構成コード']===item['構成コード'])
        }
      })
  return 情報items.reduce((docs,item)=>Object.assign(docs,{[item['構成コード']]:item}),{})
}


function set担当者(data){
  try{
    lock.waitLock(10000)
    const sheet = new Sheet({spreadsheetId:useRuntimeConfig('原資材調査'),sheetName:'原資材テーブル'})
    sheet.setItems(data)
    return data
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}


function set原資材(data){
  try{
    lock.waitLock(10000)
    const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 原資材テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'原資材テーブル'})
    const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})

    原資材テーブル.setItem(data)

    if( !(data['構成コード'] in 情報テーブル.docs)){
      情報テーブル.setItem(data)
      const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
      構成テーブル.setItems(data['構成'])
    }

    return data
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}

// 構成を編集
function set情報and構成(data){
  try{
    lock.waitLock(10000)
    const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
    const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})

    情報テーブル.setItem(data)
    構成テーブル.setItems(data['構成'])

    return data
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}


// 構成を削除
function delete情報and構成(data){
  try{
    lock.waitLock(10000)
    const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
    const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})

    情報テーブル.remove(data)
    data['構成'].forEach(構成item=>構成テーブル.remove(構成item['構成コード']))

    return data
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}