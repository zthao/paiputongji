### 牌谱统计
***
比赛场牌谱统计

### 使用方法
***
1. 在Chrome中按F12打开开发者控制台，切换到网络(Network)选项卡，然后加载雀魂界面(<https://game.maj-soul.net/1/>)

2. 进入游戏后，点击牌谱，向下滚动，直到你想要结束的位置。然后在开发者控制台中切换到WS选项卡(WebSocket)，你应该会看到一个名称为gateway的WebSocket连接。右键点击它，选择**以HAR格式保存所有内容**。

3. 运行目录下的harparser.py（需要先安装requirements.txt中的依赖项），加载刚才生成的HAR文件，就可以自动生成牌谱统计页面了
