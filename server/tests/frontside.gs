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

const runWebPageTest=()=>webPageTest.run()


////////////////////////////////////////////////////
const storesTest = new Test('storesTest')

storesTest.setTest('useMasters',()=>{
  const res = require('stores/useMasters').trim()

  return {expect:[true,true], result:[res.startsWith('const'),res.endsWith('})')]}
})

storesTest.setTest('useState',()=>{
  const res = require('stores/useState').trim()

  return {expect:[true,true], result:[res.startsWith('const'),res.endsWith('})')]}
})

storesTest.setTest('use仕様',()=>{
  const res = require('stores/useUsers').trim()

  return {expect:[true,true], result:[res.startsWith('const'),res.endsWith('})')]}
})

storesTest.setTest('use仕様',()=>{
  const res = require('stores/use仕様').trim()

  return {expect:[true,true], result:[res.startsWith('const'),res.endsWith('})')]}
})

storesTest.setTest('use原資材',()=>{
  const res = require('stores/use原資材').trim()

  return {expect:[true,true], result:[res.startsWith('const'),res.endsWith('})')]}
})

const runStoresTest = ()=>storesTest.run({})
