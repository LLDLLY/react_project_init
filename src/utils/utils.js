export function setCookie (c_name,value,expiredays) {
  var exdate=new Date()
  exdate.setDate(exdate.getDate()+expiredays)
  document.cookie=c_name+ "=" +escape(value)+ ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+';path=/'
}

export function getCookie (name) {
  var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}

export function delCookie (name) {
  var exp = new Date()
  exp.setTime(exp.getTime() - 1)
  var cval=getCookie(name)
  if(cval!=null)
    document.cookie= name + "="+cval+";expires="+exp.toGMTString()+';path=/'
}

export function parseQuery (str) {
  var qso = {};
  var qs = (str || document.location.search);
  // Check for an empty querystring
  if (qs == "") {
    return qso;
  }
  // Normalize the querystring
  qs = qs.replace(/(^\?)/, '').replace(/;/g, '&');
  while (qs.indexOf("&&") != -1) {
    qs = qs.replace(/&&/g, '&');
  }
  qs = qs.replace(/([\&]+$)/, '');
  // Break the querystring into parts
  qs = qs.split("&");
  // Build the querystring object
  for (var i = 0; i < qs.length; i++) {
    var qi = qs[i].split("=");
    qi = qi.map(function (n) {
      return decodeURIComponent(n)
    });
    if (qso[qi[0]] != undefined) {

      // If a key already exists then make this an object
      if (typeof (qso[qi[0]]) == "string") {
        var temp = qso[qi[0]];
        if (qi[1] == "") {
          qi[1] = null;
        }
        qso[qi[0]] = [];
        qso[qi[0]].push(temp);
        qso[qi[0]].push(qi[1]);

      } else if (typeof (qso[qi[0]]) == "object") {
        if (qi[1] == "") {
          qi[1] = null;
        }
        qso[qi[0]].push(qi[1]);
      }
    } else {
      // If no key exists just set it as a string
      if (qi[1] == "") {
        qi[1] = null;
      }
      qso[qi[0]] = qi[1];
    }
  }
  return qso;
}

export function dateFormat (jsonDt, format) {
  var date, timestamp, dtObj;
  timestamp = jsonDt.replace(/\/Date\((\d+)\)\//, "$1");
  date = new Date(Number(timestamp));
  dtObj = {
    "M+": date.getMonth() + 1,   //月
    "d+": date.getDate(),        //日
    "h+": date.getHours(),       //时
    "m+": date.getMinutes(),     //分
    "s+": date.getSeconds(),     //秒
  };
  //因为年份是4位数，所以单独拿出来处理
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in dtObj) {
    //dtObj的属性名作为正则进行匹配
    if (new RegExp("(" + k + ")").test(format)) {
      //月，日，时，分，秒 小于10时前面补 0
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? dtObj[k] : ("00" + dtObj[k]).substr(("" + dtObj[k]).length));
    }
  }
  return format;
}

