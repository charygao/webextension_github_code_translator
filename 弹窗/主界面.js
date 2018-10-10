/* 大小写敏感
*/

var 关键词词典 = {};

var API词典 = {
  'print': '打印',
  'append': '添加',
  'sort': '排序',
  'len': '长度',
  'end': '结尾'
}

var 命名词典 = {
  'shoplist': '购物单',
  'apple': '苹果',
  'mango': '芒果',
  'carrot': '胡萝卜',
  'banana': '香蕉',
  'rice': '米',
  'item': '物品',
  'olditem': '第一项'
}

// 这里使用有道在线翻译结果. TODO: 用翻译API代替
var 语句翻译 = {
  'this is my shopping list': '这是我的购物单',
  'i have': '我有',
  'items to purchase': '要购买的产品',
  'i also have to buy rice': '我还得买大米',
  'my shopping list is now': '我的购物单现在在',
  'i will sort my list now': '我现在就整理我的清单',
  'sorted shopping list is': '排序的购物清单是',
  'the first item i will buy is': '我要买的第一件东西是'
}

function 翻译() {
  var 原代码拷贝 = document.getElementsByTagName('table')[0];
  var span字段列表 = 原代码拷贝.getElementsByTagName('span');
  翻译字段列表(span字段列表);
  var 文本字段列表 = 取子文本节点(document);
  翻译字段列表(文本字段列表);
}

function 取子文本节点(el) {
  var n, a = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while (n = walk.nextNode()) a.push(n);
  return a;
}

// 假设每个字段除了词, 其他都是非英文字符.
function 取字段中所有词(字段) {
  var 单词 = 字段.match(/[a-zA-Z]+/g);
  if (单词) {
    return 单词;
  }
  return [字段];
}

function 取字段中最长句(字段) {
  var 句 = 字段.match(/[a-zA-Z\s]+/g);
  if (句 && 句.length > 0) {
    return 句[0].trim();
  }
  return 字段;
}

function 翻译字段列表(字段列表) {
  for (var i = 0; i < 字段列表.length; i++) {
    var 字段 = 字段列表[i].textContent;
    var 所有单词 = 取字段中所有词(字段);
    var 所有单词有翻译 = false;
    for (var j = 0; j < 所有单词.length; j++) {
      var 单词 = 所有单词[j];
      var 对应中文词 = 关键词词典[单词] || API词典[单词] || 命名词典[单词];
      if (对应中文词) {
        if (j == 所有单词.length - 1) {
          所有单词有翻译 = true;
        }
      } else {
        break;
      }
      字段 = 字段.replace(单词, 对应中文词);
    }
    // 取巧: 仅当字段中所有词有翻译时才替换字段, 避免某些文本中出现个别可识别的单词. 今后需进行语法分析.
    if (所有单词有翻译) {
      字段列表[i].textContent = 字段;
    } else {
      var 句 = 取字段中最长句(字段);
      var 对应中文 = 语句翻译[句.toLowerCase()]
      if (对应中文) {
        字段列表[i].textContent = 字段.replace(句, 对应中文);
      }
    }
  }
}

function 获取代码段() {
  //You can play with your DOM here or check URL against your regex
  var 代码段节点 = document.body.getElementsByTagName('table')[0].outerHTML
  console.log(代码段节点);
  return [代码段节点];
}

// 需允许访问activeTab, 才能调用chrome.tabs.executeScript:
function 翻译代码段() {
chrome.tabs.executeScript({
  code: '(' + 获取代码段 + ')();' //function.toString()会返回函数内容
}, (结果) => {
  // 仅有代码段的HTML码, 非DOM结构
  document.body.innerHTML = 结果[0];
  翻译();
});
}

const 关键词词典文件 = '词典数据/关键词.json'
fetch(chrome.runtime.getURL(关键词词典文件))
  .then((响应) => 响应.json())
  .then((词典数据) => 关键词词典 = 词典数据)
  .then(翻译代码段);
