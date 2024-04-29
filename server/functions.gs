ENV = 'DEV'

const useRuntimeConfig = (key) => globalThis[key+'_'+ENV]

const lock = LockService.getScriptLock()

function get自所属users(){  
  const 従業員マスタ = new Sheet({spreadsheetId:useRuntimeConfig('従業員マスタ'),key列名:'E-Mail'})

  // const currentUserEmail = Session.getActiveUser().getEmail()
  const currentUserEmail = 'yuta.ueda@kobayashi.co.jp'
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

function get自所属原資材docs(所属名=''){
  const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
  const {items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'原資材テーブル'})
  const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
  const {items:構成テーブルitems} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})

  var 自所属items = []

  if(所属名==='ﾍﾙｽｹｱ事業部 品質ﾏﾈｼﾞﾒﾝﾄ部 品質改革G' || 所属名==='日用品事業部 事業戦略推進部 品質推進G'){
    自所属items = items.filter(item=>item['品目区分名']==='原料')
  }else if(所属名.includes('開発･調達統括部')){
    自所属items = items.filter(item=>item['担当部署名']===所属名)
  }else{
    自所属items = items
  }

  const empty情報item = 情報テーブル.columns.reduce((obj,colName)=>Object.assign(obj,{[colName]:null}),{})
  自所属items.forEach(原資材item=>{ // 冗長な書き方であるが、スピードを優先している
      const {構成コード} = 原資材item
      if(構成コード){
        Object.assign(原資材item,情報テーブル.docs[構成コード])
        原資材item['構成'] = 構成テーブルitems.filter(item=>item['構成コード']===構成コード)
      }else{
        Object.assign(原資材item, empty情報item)
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

function getマスタitems(){
  const マスタ = SpreadsheetApp.openById(useRuntimeConfig('マスタ'))
  const 種別マスタ = new Sheet({spreadsheet:マスタ,sheetName:'種別マスタ'})
  const IDEAマスタv2 = new Sheet({spreadsheet:マスタ,sheetName:'IDEAマスタv2'})
  const 製法マスタ = new Sheet({spreadsheet:マスタ,sheetName:'製法マスタ'})

  return {
    種別マスタitems:種別マスタ.items,
    IDEAマスタv2items:IDEAマスタv2.items,
    製法マスタitems:製法マスタ.items,
  }
}


function set担当者(data){ // data:{品目コード, 品名, 担当者メールアドレス, 担当者名}
  try{
    lock.waitLock(10000)
    const 原資材テーブル = new Sheet({spreadsheetId:useRuntimeConfig('原資材調査'),sheetName:'原資材テーブル'})

    const newItems = data.map(item=>{
      const newItem = 原資材テーブル.docs[item['品目コード']]
      newItem['担当者メールアドレス'] = item['担当者メールアドレス']
      newItem['担当者名'] = item['担当者名']
      newItem['更新日時'] = new Date()
      return newItem
    })

    原資材テーブル.setItems(newItems)
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
    
    const newItem = 原資材テーブル.docs[data['品目コード']]
    newItem['更新日時'] = new Date()

    if(data['使いまわし']){
      // 使いまわし品は原資材テーブルに構成コードを書くのみ
      newItem['構成コード'] = data['構成コード']
      原資材テーブル.setItem(newItem)
      return newItem
    }

    const 情報テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'情報テーブル'})
    const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})    

    Object.assign(newItem,data)

    if(!newItem['構成コード']){
      const 構成コード = 情報テーブル.getNewId()
      newItem['構成コード'] = 構成コード
      newItem['構成'].forEach(item=>item['構成コード']=構成コード)
    }

    newItem['作成者メールアドレス'] = data['作成者メールアドレス']
    newItem['作成者名'] = data['作成者名']     

    原資材テーブル.setItem(newItem)
    情報テーブル.setItem(newItem)
    構成テーブル.setItems(newItem['構成'])    

    return newItem
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

    // if(!data['構成コード']){
    //   const 構成コード = 情報テーブル.getNewId()
    //   data['構成コード'] =  構成コード
    //   data['構成'].forEach(item=>item['構成コード']=構成コード)
    // }

    data['更新日時'] = new Date()

    情報テーブル.setItem(data)
    構成テーブル.setItems(data['構成'])

    data['更新日時'] = data['更新日時'].toUTCString()

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