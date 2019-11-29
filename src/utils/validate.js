export function validateEmail(value, callback) {
  var regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  if (!regEmail.test(value)) {
    callback(new Error('请填写正确邮箱地址!'))
  } else {
    callback();
  }
}

export function validateMobile(value, callback) {
  var regMobile = /^1([38]\d|4[57]|5[0-35-9]|7[06-8]|8[89])\d{8}$/
  if (!regMobile.test(value)) {
    callback(new Error('请填写正确手机号码!'))
  } else {
    callback();
  }
}
