const test1 = new Test('test1')

test1.setTest('get自所属users',()=>{
  const 自所属users = get自所属users()
  const result = 自所属users.find(user=>user['isCurrentUser'])
  const expect = { 
    '従業員番号': 10004,
    '従業員名': '竈門炭治郎',
    '所属名': 'サステナビリティ推進室',
    'メールアドレス': 't.kamado@kisatsu.com',
    isCurrentUser: true 
  }

  return {expect,result}
})

test1.setTest('sync自所属原資材docs',()=>{
  const res = sync自所属原資材docs()
  const [sampleKey, sampleItem] = Object.entries(res).shift()
  console.log(sampleKey)
  console.log(sampleItem)

  return {expect:true, result:true}
})

test1.setTest('syncMasters',()=>{
  const res = syncMasters()
  const {種別マスタitems, IDEAマスタv2items, 製法マスタitems} = res
  const result = [種別マスタitems, IDEAマスタv2items, 製法マスタitems].every(items=>items.length>0)
  return {expect:true, result}
})

const webPageTest = new Test('webPageTest')
webPageTest.setTest('doGet',()=>{
  const res = doGet()
  console.log(res.getContent())

  return {expect:true, result:true}
})

webPageTest.setTest('App',()=>{
  const res = require('App')
  console.log(res)

  return {expect:true, result:true}
})

webPageTest.setTest('Index',()=>{
  const res = require('pages/Index')
  console.log(res)

  return {expect:true, result:true}
})

webPageTest.setTest('Detail',()=>{
  const res = require('components/Detail')
  console.log(res)

  return {expect:true, result:true}
})

function exec(){
  // webPageTest.run({only:['doGet']})
  test1.run({only:['get自所属users','sync自所属原資材docs','syncMasters']})


}