const usersTest = new Test('usersTest')

usersTest.setTest('getUsers',()=>{
  const users = JSON.parse(syncUsers())
  const 植田 = users.find(user=>user['isCurrentUser'])

  return {expect:植田['メールアドレス'],result:'yuta.ueda@kobayashi.co.jp'}
})

const runUsersTest=()=>usersTest.run({})

const トランザクションspreadsheet = SpreadsheetApp.openById(トランザクションid)

const transactionsTest = new Test('transactionsTest',[
  new Sheet({spreadsheet:トランザクションspreadsheet,sheetName:'原資材'}),
  new Sheet({spreadsheet:トランザクションspreadsheet,sheetName:'仕様'}),
  new Sheet({spreadsheet:トランザクションspreadsheet,sheetName:'組成'}),
])

transactionsTest.setTest('sync原資材_get',()=>{
  const res = JSON.parse(sync原資材())

  const テスト用資材1 = res.find(item=>item['品目コード']==10000001)

  return {
    expect:{length:3,         テスト用資材1品名:'テスト用資材1'},
    result:{length:res.length,テスト用資材1品名:テスト用資材1['品名']},
  }
})

transactionsTest.setTest('sync仕様_get',()=>{
  const res = JSON.parse(sync仕様())

  return {expect:2,result:res.length}
})

// 原資材のセットで、使いまわし仕様をセットする想定
transactionsTest.setTest('sync原資材_set使いまわし仕様',()=>{
  const テスト用資材2 = JSON.parse( sync原資材() ).find(item=>item['品目コード']==10000002)

  テスト用資材2['仕様コード'] = 'siyou001'

  const res = JSON.parse( sync原資材(JSON.stringify(テスト用資材2)) )

  const {仕様コード} = res.find(item=>item['品目コード']==10000002)

  return {
    expect:{length:3,         仕様コード:'siyou001'},
    result:{length:res.length,仕様コード:仕様コード}
  }

},{reset:true,showResult:true})



// 新規で原資材の仕様をセットする
// フロントサイドでsync仕様を実行した後、sync原資材を実行する
transactionsTest.setTest('sync原資材_set新規仕様',()=>{
  const new仕様item = {
    仕様コード:null,
    仕様名:'テスト仕様3',
    使いまわし:false,
    
    組成:[
      {組成コード:null, 仕様コード:null, IDEA製品コード:'192111000', IDEA製品名:'テスト組成1', 使用量:1, 使用量単位:'g'},
      {組成コード:null, 仕様コード:null, IDEA製品コード:'192111001', IDEA製品名:'テスト組成2', 使用量:1, 使用量単位:'g'},
    ]
  }

  const res = JSON.parse( sync仕様(JSON.stringify(new仕様item)) )

  const テスト仕様3 = res.find(item=>item['仕様名']==='テスト仕様3')

  console.log(テスト仕様3)

  return {
    expect:{仕様length:3,         has仕様コード:true,                     組成length:2,                     has組成コード:true},
    result:{仕様length:res.length,has仕様コード:!!テスト仕様3['仕様コード'],組成length:テスト仕様3.組成.length,has組成コード:!!テスト仕様3.組成[0].組成コード}
  }
},{reset:true,showResult:true})


transactionsTest.setTest('sync原資材_set新規原資材',()=>{
  const テスト用資材3 = JSON.parse( sync原資材() ).find(item=>item['品目コード']==10000003)

  テスト用資材3['仕様コード'] = 'siyou003'

  const res = JSON.parse( sync原資材(JSON.stringify(テスト用資材3)) )

  console.log(res)

  const {仕様コード} = res.find(item=>item['品目コード']==10000003)

  return {
    expect:{length:3,         仕様コード:'siyou003'},
    result:{length:res.length,仕様コード:仕様コード}
  }

},{reset:true,showResult:true})

// 仕様を使いまわしにする
transactionsTest.setTest('sync仕様_set使いまわし',()=>{
  const siyou002 = JSON.parse( sync仕様() ).find(item=>item['仕様コード']==='siyou002')

  siyou002['使いまわし'] = true

  console.log(siyou002)

  const res = JSON.parse( sync仕様(JSON.stringify(siyou002)) )

  const {使いまわし, 更新日時} = res.find(item=>item['仕様コード']==='siyou002')
  
  return {
    expect:{使いまわし:true,     更新日:(new Date()).getDate()},
    result:{使いまわし:使いまわし,更新日:(new Date(更新日時)).getDate()}
  }
},{reset:true, showResult:true})


const runTransactionsTest=()=>transactionsTest.run({
  // only:['sync仕様_set使いまわし']
})

////////////////////////////////////////////////
const mastersTest = new Test('mastersTest')

mastersTest.setTest('syncMasters',()=>{
  const {種別, IDEAv2, 製法} = JSON.parse( syncMasters() )

  const getKey列名=(items)=>Object.keys(items[0])[0]

  return {
    expect:{種別:'種別コード',     IDEAv2:'IDEA製品コード',     製法:'製法コード'},
    result:{種別:getKey列名(種別), IDEAv2:getKey列名(IDEAv2),  製法:getKey列名(製法)}
  }
})

const runMastersTest=()=>mastersTest.run({})