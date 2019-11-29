import { dateFormat } from './utils'

export function dateFormatFilter (value) {
  if (!value) {
    return ''
  }
  value = value.toString()
  return dateFormat(value, 'yyyy-MM-dd hh:mm:ss')
}

export function userAccountControlFilter (value) {
  switch (value){
    case '512':
      return '启用'
      break
    case '514':
      return '禁用'
      break
    case '66048':
      return '密码永不过期'
      break
  }
}
