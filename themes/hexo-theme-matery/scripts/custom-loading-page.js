"use strict"
hexo.extend.helper.register('isFirst', function() {
  // console.log(this)
  // const flag = window.sessionStorage.getItem('flag');

  // if (flag == null) {
  //   return true
  // } else {
  //   return false
  // }
})

hexo.extend.helper.register('setFlag', function() {
  window.sessionStorage.setItem('flag', 1);
})