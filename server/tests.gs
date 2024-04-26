const test1 = new Test('test1')

test1.setTest('get自所属users',()=>{
  const 自所属users = get自所属users()
  const result = 自所属users.find(user=>user['isCurrentUser'])
  const expect = { 
    '従業員番号': 105713,
    '従業員名': '植田 雄太',
    '所属名': '製造本部 開発･調達統括部 製造技術開発部 ｴｺ戦略推進G',
    'メールアドレス': 'yuta.ueda@kobayashi.co.jp',
    isCurrentUser: true 
  }

  return {expect,result}
})

test1.setTest('webPage',()=>{
  const res = doGet()
  console.log(res)

  return {expect:true, result:true}
})

test1.setTest('get自所属原資材docs',()=>{
  const res = get自所属原資材docs()
  console.log(res)

  return {expect:true, result:true}
})

test1.setTest('getMasters',()=>{
  const res = getMasters()

  const {種別マスタitems, IDEAマスタv2items, 製法マスタitems} = res
  console.log(種別マスタitems)
  const result = [種別マスタitems, IDEAマスタv2items, 製法マスタitems].every(items=>items.length>0)

  return {expect:true, result}
})

function exec(){
  test1.run({only:'getMasters'})
}