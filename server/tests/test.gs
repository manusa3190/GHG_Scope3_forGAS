// const ss = SpreadsheetApp.openById('1xVWZE66KDxi4BX0co4Owa-uaj7RnN6FdqM8dKwQtAz0')

// const BOMサンプル = new Sheet({spreadsheet:ss,sheetName:'BOMサンプル'})
// const 素材マスタ = new Sheet({spreadsheet:ss,sheetName:'素材マスタ'})
// const 排出原単位 = new Sheet({spreadsheet:ss,sheetName:'排出原単位'})

// const bomItems = BOMサンプル.items

// function 再帰的算出(){
//   let 排出総量 = 0

//   // 再帰的処理
//   function rec(bomItem,親数量){
//     const 数量 = 親数量 * bomItem['親部品構成数量']

//     // BOMの末端に来た時は素材idがあるので、排出原単位と数量を掛け合わせて、排出総量に加算する
//     if(bomItem['素材id']){
//       const 排出原単位item = 排出原単位.items.find(item=>item['素材id']===bomItem['素材id'])
//       排出総量 = 排出総量 + 数量 * 排出原単位item['一次_排出原単位']
//       return

//     }else{
//       // 中間品の場合は、子ノードに処理を投げる。
//       const children = bomItems.filter(item=>item['親部品id']==bomItem['部品id'])
//       children.forEach(子bomItem=>rec(子bomItem,数量))
//     }
    
//   }

//   // 再帰的処理の最初は実行する
//   const 熱さま6PC = BOMサンプル.docs['3']
//   rec(熱さま6PC,1)

//   console.log(排出総量)
// }