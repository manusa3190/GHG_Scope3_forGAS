ENV = PropertiesService.getScriptProperties().getProperty('ENV')

const useRuntimeConfig = (key) => globalThis[key+'_'+ENV]

const lock = LockService.getScriptLock()

function get自所属users(){  
  const 従業員マスタ = new Sheet({spreadsheetId:useRuntimeConfig('従業員マスタ'),key列名:'E-Mail'})

  const currentUserEmail = Session.getActiveUser().getEmail()
  const currentUser = 従業員マスタ.docs[currentUserEmail]

  if(!currentUser)throw('currentUser所属名が見つかりません')

  return 従業員マスタ.items
      .filter(item=>item['所属名']===currentUser['所属名'])
      .map(item=>({
        従業員番号:item['従業員番号'],
        従業員名:item['AD_氏名'],
        所属名:item['AD_所属名'],
        メールアドレス:item['E-Mail'],
        isCurrentUser:item['E-Mail']===currentUserEmail
      }))
}

function sync自所属原資材docs(data){
  try{
    lock.waitLock(10000)
    const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 原資材テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'原資材テーブル'})
    const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
    const 組成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'組成テーブル'})

    if(data){
        data['更新日時'] = new Date()

        if(data['使いまわし']){
          // 使いまわし品は原資材テーブルに構成コードを書くのみ
          原資材テーブル.setItem(data)

        }else{
          // 使いまわしでないものは新規作成  
          if(!data['構成コード']){
            const 構成コード = 構成テーブル.getNewId()
            data['構成コード'] = 構成コード
            data['組成'].forEach(item=>item['構成コード']=構成コード)
          }
          data['構成名'] = data['品名']+'_構成'

          原資材テーブル.setItem(data)
          構成テーブル.setItem(data)
          組成テーブル.setItems(data['組成'])            
        }

        原資材テーブル.fetch()
        構成テーブル.fetch()
        組成テーブル.fetch()
    } // データ書き込み

    var 自所属items = []
    const {所属名} = get自所属users().find(user=>user.isCurrentUser)

    // if(所属名==='ﾍﾙｽｹｱ事業部 品質ﾏﾈｼﾞﾒﾝﾄ部 品質改革G' || 所属名==='日用品事業部 事業戦略推進部 品質推進G'){
    //   自所属items = 原資材テーブル.items.filter(item=>item['品目区分名']==='原料')
    // }else if(所属名.includes('開発･調達統括部')){
    //   自所属items = 原資材テーブルitems.filter(item=>item['担当所属名']===所属名)
    // }else{
    //   自所属items = items
    // }

    if(所属名==='サステナビリティ推進室'){
      自所属items = 原資材テーブル.items
    }else{
      自所属items = 原資材テーブル.items.filter(item=>item['所属名']===所属名)
    }

    const empty構成item = {
      構成名:null,
      使いまわし:false,
      作成者メールアドレス:null,
      作成者所属名:null,
      更新日時:null,
      在庫単位あたり重量:0,
      使用単位あたり重量:0,
      種別コード:'',
      容リ法分類:'対象外',
      プラスチックフラグ:false,
      製法コード:'',
      組成:[]
    }
    自所属items.forEach(原資材item=>{ // 冗長な書き方であるが、スピードを優先している
        const {構成コード} = 原資材item
        if(構成コード){
          Object.assign(原資材item,構成テーブル.docs[構成コード])
          原資材item['組成'] = 組成テーブル.items.filter(item=>item['構成コード']===構成コード)
        }else{
          Object.assign(原資材item, empty構成item)
        }
    })

    return 自所属items.reduce((docs,item)=>Object.assign(docs,{[item['品目コード']]:item}),{})
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}

function sync構成docs(){
  const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
  let {items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
  let {items:組成items} = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'組成テーブル'})

  const 構成items = items
      .filter(item=>item['使いまわし'])
      .map(item=>{
        return {
          ...item,
          組成:組成items.filter(組成item=>組成item['構成コード']===item['構成コード'])
        }
      })
  return 構成items.reduce((docs,item)=>Object.assign(docs,{[item['構成コード']]:item}),{})
}

function syncMasters(){
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

    return 'OK'
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}

// 構成を編集
function set構成and構成(data){
  try{
    lock.waitLock(10000)
    const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
    const 組成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'組成テーブル'})

    data['更新日時'] = new Date()

    構成テーブル.setItem(data)
    組成テーブル.setItems(data['組成'])

    data['更新日時'] = data['更新日時'].toUTCString()

    return data
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}


// 構成を削除
function delete構成and構成(data){
  try{
    lock.waitLock(10000)
    const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
    const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
    const 組成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'組成テーブル'})

    構成テーブル.remove(data)
    data['組成'].forEach(組成item=>組成テーブル.remove(組成item['組成コード']))

    return data
  }catch(err){
    throw(err)
  }finally{
    lock.releaseLock()
  }
}