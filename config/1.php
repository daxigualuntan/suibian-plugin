<?php
error_reporting(0);

if ($_POST) {
    if ($_POST['gmcode'] == "114514") {
        $conn = mysqli_connect('127.0.0.1', 'root', '123456', 'game_jipin') or die("数据库连接失败!");
        $conn->query('set names utf8');
        $roleid = $_POST['role'];
        switch ($_POST['sub']) {
            case 'mail': {
                $num = $_POST['num'];
                $itemid = $_POST['itemid'];
                $itemstr = '0x' . bin2hex($itemid . ',' . $num);
                $sql = "INSERT INTO `mail$roleid`(`body`, `food`, `genTime`, `gold`, `gold2`, `item`, `modifTime`, `money`, `read`, `soldier`, `title`) VALUES ('新邮件!', 0, '2024-10-17 00:00:00', 0, 0, $itemstr, 0, 0, 0, 0, '系统
				')";
                $conn->query($sql);
                echo "<script>alert('发送成功')</script>";
                break;
            }
            case 'cz': {
                $num1 = $_POST['num1'];
                $modifTime = date('Y-m-d H:i:s', time());
                $time = time();
                $token = md5($time);
                $sql = "INSERT INTO `order`(`accountID`, `first`, `genTime`, `get`, `goodsID`, `id`, `modifTime`, `num`, `order_no`, `payTime`, `rmb`,`status`, `type`, `uid`, `userID`) VALUES ('3','0','2018-11-18 09:35:53','0','18','','1970-01-01 00:00:00','$token','$token','1970-01-01 00:00:00','300000','1','2','',	'$roleid')";
                $conn->query($sql);
                $curl = curl_init();
                //设置抓取的url
                curl_setopt($curl, CURLOPT_URL, "http://127.0.0.1:10200/notifyPay?game_order=$token&userID=$roleid&type=2");
                //设置头文件的信息作为数据流输出
                curl_setopt($curl, CURLOPT_HEADER, 1);
                //设置获取的信息以文件流的形式返回，而不是直接输出。
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                //执行命令
                $data = curl_exec($curl);
                //关闭URL请求
                curl_close($curl);
                if ($result) {
                    echo "<script>alert('充值失败');history.back();</script>";
                } else {
                    echo "<script>alert('充值成功!');history.back();</script>";
                }
                break;
            }

            default: {
                echo "<script>alert('未知操作')</script>";
                break;
            }
        }
    } else {
        echo "<script>alert('GM码错误')</script>";
    }
}
?>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>GM-官居几品</title>
    <!-- 最新版本的 Bootstrap 核心 CSS 文件 -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <!-- 可选的 Bootstrap 主题文件（一般不用引入） -->
    <link rel="stylesheet" href="css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="css/bootstrap-select.min.css">
    <!-- 最新的 Bootstrap 核心 JavaScript 文件 -->
    <script src="https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/bootstrap-select.min.js"></script>
    <script src="js/i18n/defaults-zh_CN.min.js"></script>

</head>

<body>
    <div class="text-center col-md-4 center-block">
        <h1>官居几品</h1>
        <form action="" method="post">
            <div class="form-group">
                <label for="gmcode">GM码</label>
                <input type="text" class="form-control" id="gmcode" name="gmcode"
                    value="<?php echo $_POST['gmcode']; ?>">
            </div>
            <div class="form-group">
                <label for="role">角色ID</label>
                <input type="text" class="form-control" id="role" name="role" value="<?php echo $_POST['role']; ?>">
            </div>
            <div class="form-group">
                <label for="role">金额ID</label>
                <select type="text" class="form-control" id="ronum1le" name="num1">
                    <option value="18">300000元</option><!-- 该选项禁止编辑，不然充值不到账 -->
            </div> </select><br>
            <button type="submit" class="btn btn-info btn-block" name="sub" value="cz">立即充值</button><br>
            <div class="form-group">
                <label for="itemid">物品ID</label>
                <select class="form-control" name="itemid" id="itemid" data-live-search="true">
                    <?php
                    $file = fopen("item.txt", "r");
                    while (!feof($file)) {
                        $line = fgets($file);
                        $first = trim(substr($line, 0, 2));
                        if ($first != '' && $first != '!!') {
                            $txts = explode(';', $line);
                            echo '<option value="' . $txts[0] . '">' . $txts[1] . '</option>';
                        }
                    }
                    fclose($file);
                    ?>
                </select>
            </div>
            <div class="form-group">
                <label for="num">物品数量</label>
                <input type="text" class="form-control" id="num" name="num">
            </div>
            <button type="submit" class="btn btn-info btn-block" name="sub" value="mail">发送邮件</button><br>
        </form>
    </div>
</body>

</html>