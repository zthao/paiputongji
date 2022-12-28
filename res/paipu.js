const paipuArr = []
let filteredPaipu = paipuArr

class Player {
    constructor(name) {
        this.name = name
        this.accum = 0
        this.jingsuan = 0
        this.gamePlayed = 0
        this.hakoshita = 0
        this.juni = [0,0,0,0]
        this.level = '未知'
    }

    juni_litsu(rank) {
        const sum = this.juni.reduce((pre, curr) => pre + curr)
        if (sum === 0)
            return 0.0
        else
            return this.juni[rank] / sum
    }

    avg_juni() {
        let sum = 0
        for (let i = 0; i < 4; i++) {
            sum += (i + 1) * this.juni[i]
        }
        return sum / this.gamePlayed
    }
}

function renderPaipu() {
    // 需要重新计算总场次，总得失点等等
    $('table#paipu tr:not(:first)').empty()
    $('table#summary tr:not(:first)').remove()
    const playersMap = new Map()
    filteredPaipu.forEach(function(paipu) {
        const row = document.createElement('tr')
        for (let i = 0; i < 5; i++) {
            if (i === 0) {
                $(row).append(`<td><span><a class="time" href="${paipu['link']}" target="_blank">` +
                    moment(paipu['time']).format('YYYY-MM-DD HH:mm') +
                    '</a></span></td>')
            } else {
                const [name, score, level, js] = paipu['players'][i - 1]
                const td = document.createElement('td')
                const scoreSpan = document.createElement('span')
                $(scoreSpan).attr('class', 'score')
                $(scoreSpan).attr('uscore', score)
                $(scoreSpan).attr('ujs', js)
                $(scoreSpan).text(score)
                let player = playersMap.get(name)
                if (!player) {
                    player = new Player(name)
                    playersMap.set(name, player)
                }
                player.accum += (score - 25000)
                player.jingsuan += js
                player.juni[i - 1]++
                player.gamePlayed++
                player.level = level
                if (score < 0) {
                    player.hakoshita++
                    $(scoreSpan).attr('class', 'score-hakoshita')
                }
                $(td).append('<span uname=' + name +' ulevel=' + level + '>' + name + '</span>')
                $(td).append(scoreSpan)
                $(row).append(td)
            }
        }
        //$('table#paipu tr:not(:first)').remove()
        $('table#paipu').append(row)
    })

    playersMap.forEach(function(player) {
        const row = document.createElement('tr')
        // 玩家名
        $(row).append('<td>' + '[' + player.level + ']' + player.name + '</td>')
        // 总场次
        $(row).append('<td>' + player.gamePlayed + '</td>')
        // 总精算
        $(row).append('<td>' + player.jingsuan.toFixed(1) + '</td>')
        // 总得失点
        $(row).append('<td>' + player.accum + '</td>')
        // 平均顺位
        $(row).append('<td>' + player.avg_juni().toFixed(3) + '</td>')
        // 一位率~四位率
        for (let i = 0; i < 4; i++) {
            $(row).append('<td>' + (player.juni_litsu(i) * 100).toFixed(2) + '%</td>')
        }
        // 被飞次数
        $(row).append('<td>' + player.hakoshita + '</td>')
        $('table#summary').append(row)

    })
    order()
}

$(function() {
    $('table#paipu tbody tr').each(function() {
        const row = {'players': []}
        $(this).children('td').each(function(i, item) {
            if (i === 0){
                const a = $(item).find('a:first')
                row['time'] = new Date(a.text())
                row['link'] = a.attr('href')
            } else {
                //row['players'].push(Array.from($(item).children('span'),
                //    (e, i) => i == 1 ? parseInt(e.innerText) : e.innerText))
                row['players'].push([
                    $(item).children('span')[0].attributes["uname"].value,
                    parseInt($(item).children('span')[1].attributes["uscore"].value),
                    $(item).children('span')[0].attributes["ulevel"].value,
                    parseFloat($(item).children('span')[1].attributes["ujs"].value)])
            }

        })
        paipuArr.push(row)
    })
        
    $('.date-selector button[name=submit]').click(function() {
        let startDate = $('#startdate').val()
        let endDate = $('#enddate').val()
        if (startDate && endDate) {
            startDate = new Date(startDate + 'T00:00')
            endDate = moment(new Date(endDate + 'T00:00')).add(1, 'days')
            if (startDate < endDate) {
                filteredPaipu = paipuArr.filter(paipu => 
                    paipu['time'] >= startDate && paipu['time'] <= endDate
                )
                renderPaipu()
                return
            }
        }
        alert('请选择有效的开始日期和结束日期！')
    })

    $('.date-selector button[name=reset]').click(function() {
        $('#startdate').val('')
        $('#enddate').val('')
        filteredPaipu = paipuArr
        renderPaipu()
    })
})

function order(){
    var tbody = document.getElementsByTagName('tbody')[1];
    let tr = document.getElementsByTagName('tbody')[1].getElementsByTagName('tr');
    let ths = Array.from(document.getElementsByTagName('thead')[1].getElementsByTagName('th'));
    var arr = [];
    var isAsc = true;
    ths.forEach((th, index) => {
        th["addEventListener"]('click', () => {
            if(index){
                for(let i = 0; i < tr.length; i++) {
                    arr.push(tr[i]); //把tr数组复制到arr数组
                }
                arr.sort(function(tr1, tr2) { //数组排序arr.sort()
                let value1 = parseFloat(tr1.getElementsByTagName('td')[index].innerHTML);
                let value2 = parseFloat(tr2.getElementsByTagName('td')[index].innerHTML);
                return isAsc?value1-value2:value2-value1//value2.localeCompare(value1); //localeCompare() 方法提供的是比较字符串的方法，如果value2>value1,则返回1；如果value2<value1,则返回-1;相等则0
                });
                Oinsert(); //进行文档添加操作
                isAsc = !isAsc; //点击之后反转一下顺序
                arr = [];
            }
        })
    })
    function Oinsert() { //向文档添加已排好序的节点
        var fragment = document.createDocumentFragment(); //当你想提取文档的一部分，改变，增加，或删除某些内容及插入到文档末尾可以使用createDocumentFragment() 方法
        for(var j = 0; j < arr.length; j++) {
            fragment.appendChild(arr[j]); //把数组中的元素添加到节点的子节点列表的末尾
        }
        tbody.appendChild(fragment); //把fragment添加到tbody
    }
}

order()



