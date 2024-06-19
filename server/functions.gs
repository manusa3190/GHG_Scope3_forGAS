const lock = LockService.getScriptLock()

function syncUsers(){  
  const 従業員マスタ = new Sheet({spreadsheetId:従業員マスタid,sheetName:'AD',key列名:'E-Mail'})

  const currentUserEmail = Session.getActiveUser().getEmail()
  const currentUser = 従業員マスタ.docs[currentUserEmail]

  if(!currentUser)throw('currentUser所属名が見つかりません')

  const items = 従業員マスタ.items
      .filter(item=>item['AD_所属名']===currentUser['AD_所属名'])
      .map(item=>({
        従業員番号:String(item['従業員番号']),
        従業員名:item['AD_氏名'],
        所属名:item['AD_所属名'],
        メールアドレス:item['E-Mail'],
        isCurrentUser:item['E-Mail']===currentUserEmail
      }))

  return JSON.stringify(items)
}

///////////////////////////////////////
function sync原資材(data){
  try{
    lock.waitLock(10000)
    const トランザクションspreadsheet = SpreadsheetApp.openById(トランザクションid)
    const 原資材テーブル = new Sheet({spreadsheet:トランザクションspreadsheet,sheetName:'原資材'})

    if(data){
        data = JSON.parse(data)

        if(Array.isArray(data)){
          data.forEach(d=>d['更新日時'] = new Date())
          原資材テーブル.setItems(data)
        }else{
          data['更新日時'] = new Date()
          原資材テーブル.setItem(data)          
        }

        原資材テーブル.fetch()
    } // データ書き込み

    var 自所属items = []
    const users = JSON.parse(syncUsers())
    const {所属名} = users.find(user=>user.isCurrentUser)

    if(所属名==='ﾍﾙｽｹｱ事業部 品質ﾏﾈｼﾞﾒﾝﾄ部 品質改革G' || 所属名==='日用品事業部 事業戦略推進部 品質推進G'){
      自所属items = 原資材テーブル.items.filter(item=>item['品目区分名']==='原料')
    }else if(所属名.includes('開発･調達統括部')){
      自所属items = 原資材テーブル.items.filter(item=>item['担当部署名']===所属名)
    }else{
      自所属items= 原資材テーブル.items.slice(0,500)
    }

    return JSON.stringify(自所属items)
  }catch(err){
    Logger.log(err)
    throw(err)
  }finally{
    lock.releaseLock()
  }
}

function sync仕様(data){
    const トランザクションspreadsheet = SpreadsheetApp.openById(トランザクションid)
    const 仕様テーブル = new Sheet({spreadsheet:トランザクションspreadsheet,sheetName:'仕様'})
    const 組成テーブル = new Sheet({spreadsheet:トランザクションspreadsheet,sheetName:'組成'})

    if(data){
      data = JSON.parse(data)
      const {組成} = data

      if(!data['仕様コード']){
        data['仕様コード'] = 仕様テーブル.getNewId()
        組成.forEach(組成item=>{
          組成item['組成コード'] = 組成テーブル.getNewId()
          組成item['仕様コード'] = data['仕様コード']
        })
      }
            
      data['更新日時'] = new Date()

      delete data.組成

      組成テーブル.setItems(組成, '仕様コード')
      仕様テーブル.setItem(data)

      組成テーブル.fetch()
      仕様テーブル.fetch()
    }

    function formatDecimal(number) {
      // 数値を文字列に変換し、小数点以下の桁数を指定してフォーマット
      let formattedNumber = Number(number).toFixed(2);

      // 文字列を小数点で分割
      let parts = formattedNumber.split('.');

      // 小数点以下の桁数が1桁の場合は末尾に0を追加
      if (parts[1].length === 1) {
          parts[1] += '0';
      }

      // フォーマットされた数値を結合して返す
      return parts.join('.');
    }

    const items = 仕様テーブル.items
        // .filter(item=>item['使いまわし'])
        .map(item=>{
          return {
            ...item,
            在庫単位あたり重量:formatDecimal(item['在庫単位あたり重量']),
            使用単位あたり重量:formatDecimal(item['使用単位あたり重量']),
            組成:組成テーブル.items.filter(組成item=>組成item['仕様コード']===item['仕様コード'])
          }
        })

    return JSON.stringify(items)
}

///////////////////////////////////
function syncMasters(){
  const マスタ = SpreadsheetApp.openById(マスタid)
  const 種別 = new Sheet({spreadsheet:マスタ,sheetName:'種別'})
  const IDEAv2 = new Sheet({spreadsheet:マスタ,sheetName:'IDEAv2'})
  const 製法 = new Sheet({spreadsheet:マスタ,sheetName:'製法'})

  return JSON.stringify({
    種別:種別.items,
    IDEAv2:IDEAv2.items,
    製法:製法.items,
  })
}


// function set担当者(data){ // data:{品目コード, 品名, 担当者メールアドレス, 担当者名}
//   try{
//     lock.waitLock(10000)
//     const 原資材テーブル = new Sheet({spreadsheetId:useRuntimeConfig('原資材調査'),sheetName:'原資材テーブル'})

//     const newItems = data.map(item=>{
//       const newItem = 原資材テーブル.docs[item['品目コード']]
//       newItem['担当者メールアドレス'] = item['担当者メールアドレス']
//       newItem['担当者名'] = item['担当者名']
//       newItem['更新日時'] = new Date()
//       return newItem
//     })

//     原資材テーブル.setItems(newItems)

//     return 'OK'
//   }catch(err){
//     throw(err)
//   }finally{
//     lock.releaseLock()
//   }
// }

// // 構成を編集
// function set構成and構成(data){
//   try{
//     lock.waitLock(10000)
//     const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
//     const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
//     const 組成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'組成テーブル'})

//     data['更新日時'] = new Date()

//     構成テーブル.setItem(data)
//     組成テーブル.setItems(data['組成'])

//     data['更新日時'] = data['更新日時'].toUTCString()

//     return data
//   }catch(err){
//     throw(err)
//   }finally{
//     lock.releaseLock()
//   }
// }


// // 構成を削除
// function delete構成and構成(data){
//   try{
//     lock.waitLock(10000)
//     const 原資材調査spreadsheet = SpreadsheetApp.openById(useRuntimeConfig('原資材調査'))
//     const 構成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'構成テーブル'})
//     const 組成テーブル = new Sheet({spreadsheet:原資材調査spreadsheet,sheetName:'組成テーブル'})

//     構成テーブル.remove(data)
//     data['組成'].forEach(組成item=>組成テーブル.remove(組成item['組成コード']))

//     return data
//   }catch(err){
//     throw(err)
//   }finally{
//     lock.releaseLock()
//   }
// }