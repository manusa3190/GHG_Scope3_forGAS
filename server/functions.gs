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


function get自所属原資材docs(所属名){
  const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
  const {items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'原資材テーブル'})
  const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
  const {items:構成テーブルitems} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})

  const 自所属items = items.filter(item=>item['担当部署名']===所属名)

  const empty情報item = 情報テーブル.columns.reduce((obj,colName)=>Object.assign(obj,{[colName]:null}),{})
  自所属items.forEach(原資材item=>{ // 冗長な書き方であるが、スピードを優先している
      const {構成コード} = 原資材item
      if(構成コード){
        Object.assign(原資材item, 情報テーブル.docs[構成コード])
        原資材item['構成'] = 構成テーブルitems.filter(item=>item['構成コード']===構成コード)
      }else{
        Object.assign(原資材item, empty情報item)
        原資材item['構成'] = []
      }
  })
  
  return 自所属items.reduce((docs,item)=>Object.assign(docs,{[item['品目コード']]:item}),{})
}

function test(){
  console.log(get自所属原資材docs('製造本部 開発･調達統括部 製造技術開発部 ｴｺ戦略推進G'))
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

function getマスタitems(){
  var res = {}
  
  const マスタspreadsheet = SpreadsheetApp.openById('1Hzh8BZfnxdvuf5Is8FpyI12126v_ZA3C8oEm1RZbrak');
  ['品目分類', '素材', '成型方法'].forEach(masterName=>{
    const sheet = new Sheet({spreadsheet:マスタspreadsheet,sheetName:masterName + 'マスタ'})
    res[masterName+'items'] = sheet.items
  })

  return res
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