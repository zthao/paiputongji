import json
import os
import sys
import webbrowser
from jinja2 import Environment, FileSystemLoader

MAJSOUL_PAIPU_URL = 'https://game.maj-soul.net/1/?paipu='

class Player:
    def __init__(self, name):
        self.juni = [0, 0, 0, 0]
        self.accum = 0
        self.jingsuan = 0
        self.games = 0
        self.hakoshita = 0
        self.name = name
        self.level = 10000
    
    def juni_ritsu(self, rank):
        if sum(self.juni) == 0:
            return 0.0
        else:
            return self.juni[rank] / sum(self.juni)

    def avg_juni(self):
        _sum = 0
        for i in range(4):
            _sum += (i + 1) * self.juni[i]
        return _sum / self.games

def encrypt_account_id(account_id : int):
    return 1358437 + ((7 * account_id + 1117113) ^ 86216345)

def analyze(paipu_list, nickname=None):
    try:
        if nickname:
            with open(nickname+'.json', 'r', encoding='utf-8') as f:
                paipu_list2 = json.load(f)
                paipu_list1 = paipu_list
                paipu_list = []
                uuid_set = set()
                #paipu_list.extend(paipu_list2)
                for paipu_json in paipu_list1:
                    if paipu_json and paipu_json['uuid'] not in uuid_set:
                        paipu_list.append(paipu_json)
                        uuid_set.add(paipu_json['uuid'])
                for paipu_json in paipu_list2:
                    if paipu_json and paipu_json['uuid'] not in uuid_set:
                        paipu_list.append(paipu_json)
                        uuid_set.add(paipu_json['uuid'])
    except IOError:
        print ("No " + nickname + ".json")
    players = {}
    for paipu in paipu_list:
        #print(paipu)
        scoresum = 0
        rank_order = sorted(paipu['score'].items(), key = lambda t : -t[1])
        for rank, t_name_score in enumerate(rank_order):
            name, score = t_name_score
            scoresum += score
            if name not in players:
                players[name] = Player(name)
            players[name].level = paipu['level'][name]
            players[name].games += 1
            players[name].juni[rank] += 1
            players[name].accum += score - 25000
            if score < 0:
                players[name].hakoshita += 1
        rank_order2 = sorted(paipu['jingsuan'].items(), key = lambda t : -t[1])
        for rank, t_name_jingsuan in enumerate(rank_order2):
            name, jingsuan = t_name_jingsuan
            if name not in players:
                players[name] = Player(name)
            players[name].jingsuan += jingsuan
        if scoresum != 100000:
            print(paipu)
            print('!!! sum=%d !!!' % scoresum)
    
    #for player in players.values():
    #    print('玩家：%s' % player.name)
    #    print('精算：%.1f' % player.jingsuan)
    #    print('总得失点：%d' % player.accum)
    #    print('平均顺位：%.3f' % player.avg_juni())
    #    print('一位率: %.2f%%' % (player.juni_ritsu(0) * 100))
    #    print("二位率: %.2f%%" % (player.juni_ritsu(1) * 100))
    #    print("三位率: %.2f%%" % (player.juni_ritsu(2) * 100))
    #    print("四位率: %.2f%%" % (player.juni_ritsu(3) * 100))
    #    print("被飞次数：%d" % player.hakoshita)
    #    print()

    dirname = os.path.dirname(__file__)
    env = Environment(loader=FileSystemLoader(os.path.join(dirname, 'res')))
    template = env.get_template('template.html')
    output_path = os.path.abspath(os.path.join(dirname, 'index.html'))
    with open(output_path, 'w', encoding='utf-8') as html:
        html.write(template.render(
            nickname=nickname,
            data=paipu_list,
            players=players,
            url=MAJSOUL_PAIPU_URL,
        ))
        webbrowser.open_new_tab(output_path)
    
    with open(nickname+'.json', 'w', encoding='utf-8') as f:
        json.dump(paipu_list,f,ensure_ascii=False)
        print("写入文件完成...")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = 'paipu.json'
    with open(filename, 'r', encoding='utf-8') as f:
        paipu_list = json.load(f)
        analyze(paipu_list)
